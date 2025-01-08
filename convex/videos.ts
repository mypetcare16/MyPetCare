import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const add = mutation({
  args: {
    userId: v.string(),
    url: v.string(),
    cloudflareId: v.string(),
    status: v.string(),
    metadata: v.any(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert('videos', args)
    return videoId
  },
})

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('videos')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .order('desc')
      .collect()
  },
})

