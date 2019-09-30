using System;
using System.Linq;
using Microsoft.SharePoint.Client;

namespace SP.Client.Linq
{
    public interface ISpDataContext : IDisposable
    {
        string SiteUrl { get; }

        ClientContext Context { get; }

        IQueryable<TListItem> View<TListItem>(string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> View<TListItem>(string listName, string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> View<TListItem>(Uri listUrl, string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> View<TListItem>(Guid listId, string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> List<TListItem>() where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> List<TListItem>(string listName) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> List<TListItem>(Uri listUrl) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> List<TListItem>(Guid listId) where TListItem : class, IListItemEntity, new();
        
        IQueryable<TListItem> Query<TListItem>(string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> Query<TListItem>(string listName, string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> Query<TListItem>(Uri listUrl, string query) where TListItem : class, IListItemEntity, new();

        IQueryable<TListItem> Query<TListItem>(Guid listId, string query) where TListItem : class, IListItemEntity, new();
    }
}
