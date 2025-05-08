import { describe, it, expect } from "bun:test"
import { Tasks  } from "./queue"

describe("a",()=>{

    it("test 1", () => {
        const queue = new Tasks();
        queue.enqueue("hello");
    })

    it("test 2", ()=>{
        const q = new Tasks()
        q.processOnce()
    })

})