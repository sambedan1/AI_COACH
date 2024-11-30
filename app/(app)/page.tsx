"use client"

import { assistantatom, userthreadatom } from '@/atoms'
import axios from 'axios'
import { useAtom } from 'jotai'
import { Run } from 'openai/resources/beta/threads/index.mjs'
import { } from 'openai/resources/beta/threads/messages.mjs'
import { Message } from 'openai/src/resources/beta/threads/messages.js'

import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
const ChatPage = () => {
  const [Userthread] = useAtom(userthreadatom);
  const [Assistant] = useAtom(assistantatom)
  const [fetchingmsg, setfetchingmsg] = useState(false)
  const [message, setmesssage] = useState<Message[]>([])
  const [msg, setmsg] = useState('');
  const [sending, setsending] = useState(false)
  const [pollingrun, setpollingrun] = useState(false)
  const [intervalid, setintervalid] = useState(true);
  const fetchmsg = useCallback(
    async () => {
      if (!Userthread) return;
      if(intervalid){
        setfetchingmsg(true);
      }
      try {
        const response = await axios.post<{
          success: boolean,
          error?: string,
          messages?: Message[]
        }>("/api/message/list", { threadId:Userthread.ThreadId});
        if (!response.data.success || !response.data.messages) {
          console.error(response.data.error);
          return;
        }
        let newmsg = response.data.messages;
        // sort in decending order of messages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newmsg = newmsg.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }).filter(
          (msg) => msg.content[0]?.type === "text" && msg.content[0]?.text.value.trim() !== ""

        );
        setmesssage(newmsg);
      }
      catch (error) {
        console.log(error);
        setmesssage([]);

      }
      finally {
        setfetchingmsg(false);
      }

    }, [Userthread,intervalid])

  useEffect(() => {
    const interval = setInterval(async()=>{
      await fetchmsg();
      if(message.length===0){
        setintervalid(false)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchmsg,message]);

  const startRun = async (threadId: string, assistantId: string): Promise<string> => {
    try {
      const { data: { success, error, run } } = await axios.post<{
        success: boolean,
        error?: string,
        run?: Run
      }>("/api/run/create", {
        threadId,
        assistantId
      })
      if (!success || !run) {
        console.log(error);
        toast.error("Faild to start the run. Please try again");
        return "";
      }
      return run.id;
    } catch (error) {
      console.error(error);
      toast.error("Faild to start the run. Please try again");
      return "";

    }

  }

  const pollrunstatus = async (threadId: string, runId: string) => {
    setpollingrun(true);
    const intervalId = setInterval(async () => {
      try {
        const { data: { success, error, run } } = await axios.post<{
          success: boolean,
          error?: string,
          run?: Run
        }>("/api/run/retrieve", {
          threadId,
          runId
        });
        if (!success || !run) {
          console.error(error);
          toast.error("Faild to retrieve run status. Please try again");
          return;
        }
        if (run.status === "completed") {
          clearInterval(intervalId);
          setpollingrun(false);
          fetchmsg();
          return;
        }
        else if (run.status === "failed") {
          clearInterval(intervalId);
          setpollingrun(false);
          toast.error("The run failed. Please try again");
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Faild to retrieve run status. Please try again");
        clearInterval(intervalId);
        return;

      } finally {
        setsending(false);
      }

    }, 1000);

    return () => clearInterval(intervalId);

  }

  const sendMessage = async () => {
    //validation message
    if (!Userthread || sending || !Assistant) {
      toast.error("Faild to send Message.Please try again");
      return;
    }
    setsending(true);
    //create msg object
    try {
      const { data: { message: newmsg } } = await axios.post<{
        success: boolean,
        error?: string
        message?: Message
      }>("/api/message/create", {
        threadId: Userthread.ThreadId,
        message: msg,
        fromUser: "true"
      });
      //update our message withour new response message
      if (!newmsg) {
        console.error("no message return");
        toast.error("Faild to send Message.Please try again");
        return;
      }
      setmesssage((prev) => [...prev, newmsg]);
      setmsg("");
      toast.success("message sent");
      //start a run and going to polling it
      const runId = await startRun(Userthread.ThreadId, Assistant);
      if (!runId) {
        toast.error("Faild to start the run.");
        return;
      }
      pollrunstatus(Userthread.ThreadId, runId);

    } catch (error) {
      console.log(error);
      toast.error("Faild to send Message. Please try again");
      return;
    } finally {
      setsending(false);
    }


  };

  return (
    <div className='w-full h-[calc(100vh-64px)] flex flex-col bg-black text-white '>
      {/* messages */}
      <div className='flex-grow overflow-y-scroll p-8 space-y-2 '>
        {/* fetch msg */}
        {
          fetchingmsg && message.length === 0 && (<div className='text-center font-bold'>Fetching....</div>)
        }
        {/* no message */}
        {message.length === 0 && !fetchingmsg && (<div className='text-center font-bold'>Motivation message.</div>)}

        {/* listing messages */}
        {
          message.map((message) => (
            <div key={message.id}
              className={`px-4 py-2 mb-3 rounded-lg w-fit text-lg ${["true", "True"].includes(
                (message.metadata as { fromUser?: string }).fromUser ?? ""
              )
                ? "bg-yellow-500 ml-auto"
                : "bg-gray-700"
                }`}
            >
              {message.content[0].type === "text" ?
                message.content[0].text.value
                  .split("\n")
                  .map((text, index) => <p key={index}>{text}</p>)
                : null}
            </div>

          ))
        }
      </div>
      {/* input container */}
      <div className='mt-auto p-4 bg-gray-800'>
        <div className='flex items-center bg-white p-2'>
          <input
            type='text'
            className='flex-grow bg-transparent focus:outline-none text-black'
            placeholder='Type your message here...'
            value={msg}
            onChange={(e) => setmsg(e.target.value)}
          />
          <button disabled={!Userthread || sending || !Assistant || !msg.trim()}
            className='ml-4 bg-yellow-500 px-4 text-white py-2 rounded-full focus:outline-none disabled:bg-yellow-700'
            onClick={sendMessage}
          >{sending ? "sending..." : pollingrun ? "polling Run..." : "Send"}</button>
        </div>

      </div>
    </div>
  )
}

export default ChatPage