import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Mux from '@mux/mux-node'

// Mux direct upload URL жасайды
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Браузердің нақты origin-ін аламыз (cors үшін)
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? '*'

  try {
    const mux = new Mux({
      tokenId:     process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    })

    const upload = await mux.video.uploads.create({
      cors_origin: origin,
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'none',
      },
    })

    return NextResponse.json({
      uploadId:  upload.id,
      uploadUrl: upload.url,
    })
  } catch (err: any) {
    console.error('Mux upload error:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Mux upload failed' }, { status: 500 })
  }
}
