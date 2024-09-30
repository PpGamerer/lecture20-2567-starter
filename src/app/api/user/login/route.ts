import { NextRequest, NextResponse } from "next/server";
import sleep from "sleep-promise";
import { DB, readDB } from "@lib/DB";
import { Database } from "@lib/types";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { username, password } = body;

  //you should do the validation here
  readDB();
  const user = (<Database>DB).users.find(
    // (user) => user.username === username && user.password === password
    (user) =>
      user.username === username && bcrypt.compareSync(password, user.password)
  );

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Username or password is incorrect",
      },
      { status: 400 }
    );
  }

  const secret = process.env.JWT_SECRET || "This is another secret";

  //if found user, sign a JWT TOKEN
  const token = jwt.sign(
    { username, role: user.role, studentId: user.studentId },
    secret,
    { expiresIn: "8h" }
  );

  await sleep(1000);

  return NextResponse.json({ ok: true, token, username });
};
