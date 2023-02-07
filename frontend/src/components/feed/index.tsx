import { SparklesIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Input from "@components/submit-modal";
import Moment, { PostType } from "@components/moment";
import { ThemeToggle } from "@components/layout/theme-toggle";
import { mockMoments } from "src/mock/data";

export default function Feed() {
  const [posts, setPosts] = useState<Array<PostType>>([]);
  useEffect(() => setPosts(mockMoments()), []);
  return (
    <div className="xl:ml-[370px] border-l border-r border-primary xl:min-w-[576px] sm:ml-[73px] flex-grow max-w-xl">
      <div className="flex py-2 px-3 sticky top-0 z-50 bg-base-200 border-primary">
        <h2 className="text-lg sm:text-xl font-bold cursor-pointer my-auto">
          Home
        </h2>
        <div className="hoverEffect flex items-center justify-center px-0 ml-auto w-9 h-9">
          {/* <SparklesIcon className="h-5" /> */}
          <ThemeToggle />
        </div>
      </div>
      {/* <Input /> */}
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Moment key={post.id} post={post} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
