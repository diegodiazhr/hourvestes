
'use client';

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { Header } from "./header";

export function StudentOnboarding() {
    const { userProfile } = useAuth();
    const name = userProfile?.name.split(' ')[0];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-lg mx-auto p-4">
                    <Sparkles className="mx-auto h-16 w-16 text-yellow-400 mb-6" />
                    <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                        ¡Bienvenido a tu aventura CAS, {name}!
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Estás a un solo paso de empezar a documentar tus proyectos, registrar tus horas y reflexionar sobre tu increíble viaje.
                    </p>
                    <Button asChild size="lg" className="text-lg">
                        <Link href="/projects/new">
                            ✨ Crear mi primer proyecto
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
