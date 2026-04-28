using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs
{
    public class SongHub : Hub
    {
        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
    }
}
