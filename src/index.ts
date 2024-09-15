import { Plugin } from 'vite';
import fs from "fs";
import path from "path"
import ws from "websocket"
import { execSync } from "child_process"
import * as chokidar from "chokidar"

const { client: wsclient } = ws

type Params = {
  theme_id?: string
  upload_url?: string
  store_id?: string
  draft_id?: string
  wsport?: number
  sallaCli?: string
}

let params: Params = {}
let connection: ws.connection

export const sallaWatcher = () : Plugin => {
  return {
    name: 'vite-plugin-salla-watcher',
    apply: 'build',
    config() {
      const cachePath = path.join(process.cwd(), "/node_modules/.salla-cli")
      if (fs.existsSync(cachePath))
        params = JSON.parse(fs.readFileSync(cachePath, "utf8"))

      const client = new wsclient()
      client.on("connectFailed", error => {
        console.error(
          "[x] Oops! Hot reload is currently not working. Check the error message for details: ",
          error.toString(),
        )
      })

      client.on("connect", _connection => {
        connection = _connection

        console.log(
          `✓ Performing hot reload on port ws://localhost:${params.wsport}`,
        )
      })

      client.connect(`ws://localhost:${params.wsport}`, "echo-protocol")

      const watcher = chokidar.watch(["src/**/*.json", "src/**/*.twig"], {
        ignored: './node_modules',
        persistent: true,
      })

      watcher.on("change", path => {
        if (path.endsWith(".twig") || path.endsWith(".json")) {
          try {
            execSync(
              `${params.sallaCli} theme sync -f "${path}" -id ${params.theme_id}  -store_id ${params.store_id} -draft_id ${params.draft_id}  -upload_url ${params.upload_url}`,
              { stdio: "inherit" },
            )
            connection.send(JSON.stringify({ msg: "reload" }))
          } catch (e) {
            console.log(e)
          }
        }
      })
    },
    buildEnd() {
      connection.send(JSON.stringify({ msg: "reload" }))
    }
  };
}

export default {
  sallaWatcher
}