import { AnimatePresence, motion } from "framer-motion"
import { Moment } from "./moment"

export const AleoLayout=({data}:any)=>{
    return (
        // card ui
        <div>
             <AnimatePresence>
          {data?.map((moment:any) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Moment key={moment.id} moment={moment} />
            </motion.div>
          ))}
        </AnimatePresence>
        </div>
    )
}