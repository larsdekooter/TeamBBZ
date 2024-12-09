import Page from "@/components/Page";
import { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    const getS = async () => {
      await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ input: "https://www.example.org" }),
      });
    };
    getS();
  }, []);
  return <Page></Page>;
}
