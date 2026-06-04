export interface Env {
  GAME_ROOMS: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("room");

    if (!roomId) {
      return new Response("Missing room parameter", { status: 400 });
    }

    // Get Durable Object instance by ID
    const id = env.GAME_ROOMS.idFromName(roomId);
    const roomObject = env.GAME_ROOMS.get(id);

    // Forward the request to the Durable Object
    return roomObject.fetch(request);
  },
};

interface Connection {
  socket: WebSocket;
  side: "usa" | "ussr" | "observer";
}

export class GameRoom implements DurableObject {
  state: DurableObjectState;
  env: Env;
  connections: Connection[] = [];
  gameState: any = null;
  timerInterval: any = null;
  timerSecondsLeft = 60;
  activeTurnSide: "usa" | "ussr" | "none" = "none";

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      return new Response(
        JSON.stringify({
          connections: this.connections.map((c) => c.side),
          timer: this.timerSecondsLeft,
          activeSide: this.activeTurnSide,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    // Set up WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Get requested side / role
    const sideParam = url.searchParams.get("side") as "usa" | "ussr" | "observer" | null;
    let assignedSide: "usa" | "ussr" | "observer" = sideParam || "observer";

    // Auto-balance if they choose a taken side
    if (assignedSide === "usa" && this.connections.some((c) => c.side === "usa")) {
      assignedSide = "ussr";
    } else if (assignedSide === "ussr" && this.connections.some((c) => c.side === "ussr")) {
      assignedSide = "usa";
    }

    // If both sides taken, they become an observer
    if (
      (assignedSide === "usa" && this.connections.some((c) => c.side === "usa")) ||
      (assignedSide === "ussr" && this.connections.some((c) => c.side === "ussr"))
    ) {
      assignedSide = "observer";
    }

    await this.handleSession(server, assignedSide);

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleSession(socket: WebSocket, side: "usa" | "ussr" | "observer") {
    socket.accept();

    const conn: Connection = { socket, side };
    this.connections.push(conn);

    // Send assignment role message
    socket.send(
      JSON.stringify({
        type: "INIT",
        side,
        gameState: this.gameState,
        timer: this.timerSecondsLeft,
      })
    );

    // Notify others
    this.broadcast({
      type: "PLAYER_JOINED",
      side,
      message: `${side.toUpperCase()} has joined the room.`,
    });

    socket.addEventListener("message", (msg) => {
      try {
        const data = JSON.parse(msg.data as string);
        this.handleMessage(side, data);
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    });

    socket.addEventListener("close", () => {
      this.connections = this.connections.filter((c) => c.socket !== socket);
      this.broadcast({
        type: "PLAYER_LEFT",
        side,
        message: `${side.toUpperCase()} has left the room.`,
      });
      if (this.connections.length === 0) {
        this.stopTimer();
      }
    });
  }

  handleMessage(side: "usa" | "ussr" | "observer", data: any) {
    switch (data.type) {
      case "GAME_STATE_UPDATE":
        this.gameState = data.gameState;
        this.broadcast({
          type: "GAME_STATE_SYNC",
          gameState: this.gameState,
        });
        break;

      case "SUBMIT_ACTION":
        this.broadcast({
          type: "ACTION_SUBMITTED",
          side,
          action: data.action,
        });
        break;

      case "START_TIMER":
        this.activeTurnSide = data.activeSide || "none";
        this.startTimer();
        break;

      case "RESET_TIMER":
        this.resetTimer();
        break;

      case "CHAT":
        this.broadcast({
          type: "CHAT_MSG",
          side,
          text: data.text,
        });
        break;
    }
  }

  startTimer() {
    this.stopTimer();
    this.timerSecondsLeft = 60;
    this.broadcast({ type: "TIMER_TICK", seconds: this.timerSecondsLeft });

    // Use a periodic check
    this.timerInterval = setInterval(() => {
      this.timerSecondsLeft--;
      this.broadcast({ type: "TIMER_TICK", seconds: this.timerSecondsLeft });

      if (this.timerSecondsLeft <= 0) {
        this.stopTimer();
        this.broadcast({
          type: "TIMER_TIMEOUT",
          side: this.activeTurnSide,
        });
      }
    }, 1000);
  }

  resetTimer() {
    this.timerSecondsLeft = 60;
    this.broadcast({ type: "TIMER_TICK", seconds: this.timerSecondsLeft });
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  broadcast(message: any) {
    const data = JSON.stringify(message);
    for (const conn of this.connections) {
      try {
        conn.socket.send(data);
      } catch (err) {
        console.error("Failed to send socket broadcast", err);
      }
    }
  }
}
