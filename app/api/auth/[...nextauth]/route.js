import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        await connectDB();
        // Check karein ke user database mein hai ya nahi
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("User nahi mila!");

        // Password match karein
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) throw new Error("Ghalat password!");

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login", // Hamara custom login page
  },
  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };