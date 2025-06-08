import { Head } from "$fresh/runtime.ts";
import BoardLock from "../islands/BoardLock.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>BoardLock - Kanban Board</title>
      </Head>
      <BoardLock />
    </>
  );
}
