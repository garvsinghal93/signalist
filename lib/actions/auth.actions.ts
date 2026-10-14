'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({ body: { email, password, name: fullName } })

        if (response) {
            const hasInngestConfig = Boolean(process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SIGNING_KEY);

            if (hasInngestConfig) {
                try {
                    await inngest.send({
                        name: 'app/user.created',
                        data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                    });
                } catch (inngestError) {
                    console.warn('Inngest signup event skipped because the Inngest config is unavailable or invalid:', inngestError);
                }
            } else {
                console.warn('INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY not set; skipping signup event dispatch.');
            }
        }

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign up failed', e)
        return { success: false, error: 'Sign up failed' }
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({ body: { email, password } })

        return { success: true, data: response }
    } catch (e) {
        console.log('Sign in failed', e)
        return { success: false, error: 'Sign in failed' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.log('Sign out failed', e)
        return { success: false, error: 'Sign out failed' }
    }
}
