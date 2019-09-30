using Microsoft.SharePoint.Client;

namespace SP.Client.Linq.Infrastructure
{
    public interface ICustomMapping
    {
        void MapFrom(ListItem listItem);

        bool MapTo(ListItem listItem);
    }
}
