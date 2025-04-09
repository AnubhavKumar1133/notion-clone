// import { adminDb } from "@/firebase-admin";
// import liveblocks from "@/lib/liveblocks";
// import { auth } from "@clerk/nextjs/server";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST (req: NextRequest){
//     auth.protect()
//     const {sessionClaims} = await auth();
//     const {room} = await req.json();

//     const session = liveblocks.prepareSession(sessionClaims?.email!, {
//         userInfo:{
//             name: sessionClaims?.fullName!,
//             email: sessionClaims?.email!,
//             avatar: sessionClaims?.image!,
//         }
//     })
//     const usersInRoom = await adminDb.collectionGroup("rooms").where("userId", "==", sessionClaims?.email).get();

//     const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);

//     if(userInRoom?.exists){
//         session.allow(room, session.FULL_ACCESS);
//         const {body, status} = await session.authorize();
//         console.log("Authorization successful")
//         return new Response(body, {status})
//     }else{
//         return NextResponse.json(
//             {message: "You are not in this room"},
//             {status: 403}
//         )
//     }
// }

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (process.env.DISABLE_AUTH_ENDPOINT === "true") {
    return NextResponse.json({ message: "Skipped during build" }, { status: 200 });
  }
  try {
    // Protect the route
    auth.protect();

    const { sessionClaims } = await auth();

    // Validate and parse request body
    let room: string;
    try {
      const body = await req.json();

      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { message: "Invalid request body format" },
          { status: 400 }
        );
      }

      room = body.room;

      if (!room || typeof room !== "string") {
        return NextResponse.json(
          { message: "Invalid room ID" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Failed to parse JSON body:", error);
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate session claims
    if (!sessionClaims?.email) {
      return NextResponse.json(
        { message: "Unauthorized - missing email" },
        { status: 401 }
      );
    }

    const session = liveblocks.prepareSession(sessionClaims.email, {
      userInfo: {
        name: sessionClaims.fullName || "",
        email: sessionClaims.email,
        avatar: sessionClaims.image || "",
      },
    });

    const usersInRoom = await adminDb
      .collectionGroup("rooms")
      .where("userId", "==", sessionClaims.email)
      .get();

    const userInRoom = usersInRoom.docs.find((doc) => doc.id === room);

    if (userInRoom?.exists) {
      session.allow(room, session.FULL_ACCESS);
      const { body, status } = await session.authorize();
      console.log("Authorization successful");
      return new Response(body, { status });
    } else {
      return NextResponse.json(
        { message: "You are not in this room" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error in auth endpoint:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
