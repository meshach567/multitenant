'use client';

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const router = useRouter();

  async function submit() {
    await axios.post(`${API_URL}/auth/verify-email`, { email, otp });
    router.push('/login');
  }

  return (
    <>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="OTP" onChange={e => setOtp(e.target.value)} />
      <button onClick={submit}>Verify</button>
    </>
  );
}
