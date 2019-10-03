using JetBrains.Annotations;
using Microsoft.SharePoint.Client;
using SP.Client.Extensions;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Provisioning;
using SP.Client.Linq.Query;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Client.Linq
{
    /// <summary>
    /// SharePoint context
    /// IDisposable
    /// ******************************************************************************************************************
    /// Usage: var spContext = new SpDataContext("https://sp-site")
    /// spContext.Context.Credentials = new SharePointOnlineCredentials("user@domain", ConvertToSecureString("password"));
    /// ******************************************************************************************************************
    /// Examples:
    /// var items = spContext.List<Email>("Emails")
    ///        .Where(i => (i.Title.Contains("Test") || i.Title.StartsWith("Test")) &&
    ///                    (i.Includes(x => x.Account, 1, 2)) &&
    ///                    (i.LookupIdIncludes(x => x.Contact, 1)) &&
    ///                    (i.Created > DateTime.Today || (i.Id > 1 && i.Id < 100)) ||                           
    ///                    (i.Account == null && i.Contact != null) &&
    ///                     i.IsMembership(x => x.AssignedTo, SP.Client.Caml.Operators.MembershipType.AllUsers))
    ///        .Include(i => i.Id, i=> i.Title).GroupBy<Email>(i => i.Title).OrderBy(i => i.Id);
    /// --------------------------------------------------------------------------------------------------------       
    /// var events = spContext.List<Event>("Calendar")
    ///                    .Where(e => e.StartTime < DateTime.Today.AddMonths(-1) &&
    ///                                e.DateRangesOverlap(x => x.StartTime, x => x.EndTime, x => x.RecurrenceId, CamlValue.Month));
    ///</summary>
    public class SpDataContext : ISpEntryDataContext
    {
        #region Properties
        /// <summary>
        /// Site Url.
        /// </summary>
        public string SiteUrl { get; private set; }

        /// <summary>
        /// CSOM context
        /// </summary>
        public ClientContext Context { get; private set; }

        #endregion

        #region Constructor
        /// <summary>
        /// SharePoint context
        /// </summary>
        /// <param name="siteUrl">Site Url: https://sp-site
        /// </param>
        public SpDataContext([NotNull]string siteUrl)
        {
            Check.NotNull(siteUrl, nameof(siteUrl));
            SiteUrl = siteUrl;
            Context = new ClientContext(siteUrl);
        }

        public event Action<ISpEntryDataContext, SpSaveArgs> OnBeforeSaveChanges;
        public event Action<ISpEntryDataContext, SpSaveArgs> OnAfterSaveChanges;

        #endregion

        #region Methods

        public IQueryable<TListItem> View<TListItem>(string query)
            where TListItem : class, IListItemEntity, new()
        {
            var listAtt = AttributeHelper.GetCustomAttributes<TListItem, ListAttribute>(false).FirstOrDefault();
            if (listAtt != null)
            {
                return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, listAtt.Title, listAtt.Url, default, query));
            }
            throw new Exception($"{nameof(ListAttribute)} in {typeof(TListItem)} class is not found.");
            //return Enumerable.Empty<TListItem>().AsQueryable();
        }

        public IQueryable<TListItem> View<TListItem>(string listTitle, string query)
          where TListItem : class, IListItemEntity, new()
        {
            return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, listTitle, null, default, query));
        }

        public IQueryable<TListItem> View<TListItem>(Uri listUrl, string query)
            where TListItem : class, IListItemEntity, new()
        {
            return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, null, listUrl == null
                ? null : (listUrl.IsAbsoluteUri ? listUrl.LocalPath : listUrl.OriginalString), default, query));
        }

        public IQueryable<TListItem> View<TListItem>(Guid listId, string query)
          where TListItem : class, IListItemEntity, new()
        {
            return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, null, null, listId, query));
        }

        public IQueryable<TListItem> List<TListItem>()
            where TListItem : class, IListItemEntity, new()
        {
            return View<TListItem>(null);
        }

        /// <summary>
        /// SP List
        /// </summary>
        /// <typeparam name="TListItem"></typeparam>
        /// <param name="listTitle">List title</param>
        /// <returns></returns>
        public IQueryable<TListItem> List<TListItem>(string listTitle)
            where TListItem : class, IListItemEntity, new()
        {
            return View<TListItem>(listTitle, null);
        }

        /// <summary>
        /// SP List
        /// </summary>
        /// <typeparam name="TListItem"></typeparam>
        /// <param name="listUrl">List url</param>
        /// <returns></returns>
        public IQueryable<TListItem> List<TListItem>(Uri listUrl)
           where TListItem : class, IListItemEntity, new()
        {
            return View<TListItem>(listUrl, null);
        }

        /// <summary>
        /// SP List
        /// </summary>
        /// <typeparam name="TListItem"></typeparam>
        /// <param name="listId">List id</param>
        /// <returns></returns>
        public IQueryable<TListItem> List<TListItem>(Guid listId)
          where TListItem : class, IListItemEntity, new()
        {
            return View<TListItem>(listId, null);
        }

        public IQueryable<TListItem> List<TListItem>(SpQueryArgs<ISpEntryDataContext> args)
          where TListItem : class, IListItemEntity, new()
        {
            return new SpEntityQueryable<TListItem>(args);
        }

        public IQueryable<TListItem> Query<TListItem>(string query = null)
        where TListItem : class, IListItemEntity, new()
        {
            var listAtt = AttributeHelper.GetCustomAttributes<TListItem, ListAttribute>(false).FirstOrDefault();
            if (listAtt != null)
            {
                return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, listAtt.Title, listAtt.Url, default, query) { SkipResult = true });
            }
            throw new Exception($"{nameof(ListAttribute)} in {typeof(TListItem)} class is not found.");
            //return Enumerable.Empty<TListItem>().AsQueryable();
        }

        public IQueryable<TListItem> Query<TListItem>(string listTitle, string query = null)
          where TListItem : class, IListItemEntity, new()
        {
            return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, listTitle, null, default, query) { SkipResult = true });
        }

        public IQueryable<TListItem> Query<TListItem>(Uri listUrl, string query = null)
         where TListItem : class, IListItemEntity, new()
        {
            return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, null, (listUrl.IsAbsoluteUri ? listUrl.LocalPath : listUrl.OriginalString), default, query) { SkipResult = true });
        }

        public IQueryable<TListItem> Query<TListItem>(Guid listId, string query = null)
          where TListItem : class, IListItemEntity, new()
        {
            return List<TListItem>(new SpQueryArgs<ISpEntryDataContext>(this, null, null, listId, query) { SkipResult = true });
        }

        public virtual bool SaveChanges()
        {
            var args = new SpSaveArgs() { Items = new List<ListItem>() };
            OnBeforeSaveChanges?.Invoke(this, args);
            if (args.HasChanges)
            {
                Context.ExecuteQuery();
                OnAfterSaveChanges?.Invoke(this, args);
            }
            return args.HasChanges;
        }

        #endregion

        #region IDisposable Methods

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        ~SpDataContext()
        {
            Dispose(false);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (Context != null)
            {
                try
                {
                    Context.Dispose();
                }
                catch { }
                Context = null;
            }
        }

        TProvisionModel ISpEntryDataContext.CreateModel<TProvisionModel, TDataContext, TEntity>()
        {
            return CreateModel<SpProvisionModel<SpDataContext, ListItemEntity>, SpDataContext, ListItemEntity>() as TProvisionModel;
        }

        public virtual TProvisionModel CreateModel<TProvisionModel, TDataContext, TEntity>()
          where TProvisionModel : SpProvisionModel<TDataContext, TEntity>
          where TDataContext : SpDataContext
          where TEntity : class, IListItemEntity
        {
            return (TProvisionModel)Activator.CreateInstance(typeof(TProvisionModel), new object[] { this });
        }

        public virtual SpProvisionModel<TDataContext, TEntity> CreateModel<TDataContext, TEntity>()
        where TDataContext : SpDataContext
        where TEntity : class, IListItemEntity
        {
            return new SpProvisionModel<TDataContext, TEntity>((TDataContext)this);
        }

        public virtual SpProvisionModel<SpDataContext, TEntity> CreateModel<TEntity>()
         where TEntity : class, IListItemEntity
        {
            return new SpProvisionModel<SpDataContext, TEntity>(this);
        }

        #endregion
    }
}
