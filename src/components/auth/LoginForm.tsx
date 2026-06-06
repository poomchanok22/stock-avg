"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, TrendingUp } from "lucide-react"
import { loginSchema, type LoginInput } from "@/schemas/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast({ title: "Login failed", description: result.error, variant: "destructive" })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Stock AVG Calculator</h1>
          <p className="text-sm text-muted-foreground">คำนวณต้นทุนเฉลี่ยหุ้นของคุณ</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>กรอก Email และ Password เพื่อเข้าใช้งาน</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  เข้าสู่ระบบ
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                สมัครสมาชิก
              </Link>
            </div>

            <div className="mt-4 rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Demo Account:</p>
              <p>Email: demo@example.com</p>
              <p>Password: demo1234</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
