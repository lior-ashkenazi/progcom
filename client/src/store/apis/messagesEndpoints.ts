import { apiSlice } from "./apiSlice";

apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: ({ chatId, ...messageDetails }) => ({
        url: `/messages/${chatId}`,
        method: "POST",
        body: messageDetails,
      }),
      invalidatesTags: [{ type: "Messages" }],
    }),
    fetchMessages: builder.query({
      query: (chatId) => `messages/${chatId}`,
      providesTags: [{ type: "Messages" }],
    }),
  }),
});
