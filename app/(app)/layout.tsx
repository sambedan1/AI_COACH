"use client"
import { assistantatom, userthreadatom } from "@/atoms";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useAtom } from "jotai";
import { useEffect } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>

) {
  const [, setUserthread] = useAtom(userthreadatom)
  const [Assistant, setAssistant] = useAtom(assistantatom);
  useEffect(() => {
    if (Assistant) return;
    setAssistant(process.env.NEXT_PUBLIC_GOGGINS_ASSISTANT_ID)
  }, [setAssistant, Assistant]);
  interface UserThreadType {
    ThreadId: string,
    UserId:string,
    date:string
    // Add other properties if they exist
  }

  useEffect(() => {

     async function getuserthread(){
      try {
        const response = await axios.get<{
          success: boolean,
          message?: string,
          userThread?:UserThreadType
  
        }>('/api/user-thread');
        if (!response.data.success ||!response.data.userThread) {
          console.error(response.data.message?? "Unknown error");
          setUserthread(null);
          return
        }
        setUserthread(response.data.userThread);
        
      } catch (error) {
        console.log(error);
        setUserthread(null)

        
      }
      

    }

    // ..................................
    // const threadid = localStorage.getItem("goggins_ai_thread_id");
    // if (!threadid) {
    //   async function threadid() {
    //     try {
    //       const response = await axios.post("/api/thread");
    //       if (!response.data.success || !response.data.userthread) {
    //         console.log(response.data.error);
    //         setUserthread(null)
    //         return;
    //       }
    //       setUserthread(response.data.userthread.id);
    //       console.log(response.data.userthread.id);
    //       localStorage.setItem("goggins_ai_thread_id", response.data.userthread.id);
    //     } catch (error) {
    //       console.error(error);
    //       setUserthread(null)
    //     }

    //   }
    //   threadid();
    // }
    // else {
    //   setUserthread(threadid);
    // }
    getuserthread();
    //..............................
  }, [setUserthread ])

  return (
    <div className="flex flex-col w-full h-full">
      <Navbar />
      {children}
    </div>
  );
}