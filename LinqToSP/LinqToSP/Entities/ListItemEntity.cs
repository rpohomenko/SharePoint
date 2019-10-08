using Microsoft.SharePoint.Client;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Infrastructure;
using SP.Client.Linq.Provisioning;
using System;
using System.ComponentModel;
using System.Runtime.Serialization;

namespace SP.Client.Linq
{
    [Serializable]
    [DataContract]
    public class ListItemEntity : IListItemEntity, ICustomMapping, ISpChangeTracker
    {
        private string _title;
        private string _contentTypeId;

        public ListItemEntity()
        {
        }

        #region Properties

        [DataMember]
        public int Id { get; internal set; }

        [DataMember]
        [Field("Title", FieldType.Text, Required = true, Behavior = ProvisionBehavior.None)]
        public virtual string Title
        {
            get { return _title; }
            set
            {
                if (value == _title) return;

                OnPropertyChanging(nameof(Title), _title);
                _title = value;
                OnPropertyChanged(nameof(Title), value);
            }
        }

        /// <summary>
        /// Effective Permissions
        /// </summary>
        public BasePermissions EffectiveBasePermissions
        {
            get; internal set;
        }

        /// <summary>
        /// Version
        /// </summary>
        [DataMember]
        [Field(Name = "owshiddenversion", DataType = FieldType.Integer, IsReadOnly = false, Behavior = ProvisionBehavior.None)]
        public int? Version
        {
            get; internal set;
        }

        /// <summary>
        /// Content Type ID
        /// </summary>
        [DataMember]
        public virtual string ContentTypeId
        {
            get { return _contentTypeId; }
            set
            {
                if (value == _contentTypeId) return;

                OnPropertyChanging(nameof(ContentTypeId), _contentTypeId);
                _contentTypeId = value;
                OnPropertyChanged(nameof(ContentTypeId), value);
            }
        }

        /// <summary>
        /// Author
        /// </summary>
        [LookupField(Name = "Author", DataType = FieldType.User, IsReadOnly = true, Behavior = ProvisionBehavior.None)]
        [DataMember]
        public FieldLookupValue CreatedBy
        {
            get; internal set;
        }

        /// <summary>
        /// Created date
        /// </summary>
        [Field(Name = "Created", DataType = FieldType.DateTime, IsReadOnly = true, Behavior = ProvisionBehavior.None)]
        [DataMember]
        public DateTime? Created { get; internal set; }

        /// <summary>
        /// Editor
        /// </summary>
        [LookupField(Name = "Editor", DataType = FieldType.User, IsReadOnly = true, Behavior = ProvisionBehavior.None)]
        [DataMember]
        public FieldLookupValue ModifiedBy
        {
            get; internal set;
        }

        /// <summary>
        /// Modified date
        /// </summary>
        [Field(Name = "Modified", DataType = FieldType.DateTime, IsReadOnly = true, Behavior = ProvisionBehavior.None)]
        [DataMember]
        public DateTime? Modified
        {
            get; internal set;
        }

        [Field(Name = "FileDirRef", IsReadOnly = true, DataType = FieldType.Text, Behavior = ProvisionBehavior.None)]
        public string ParentFolderUrl
        {
            get; internal set;
        }

        public event PropertyChangingEventHandler PropertyChanging;
        public event PropertyChangedEventHandler PropertyChanged;

        #endregion

        #region Methods

        public bool DetectChanges(string propKey, FieldAttribute field, object originalValue, ref object currentValue)
        {
            return !Equals(originalValue, currentValue);
        }

        public virtual void MapFrom(ListItem listItem)
        {
        }

        public virtual bool MapTo(ListItem listItem)
        {
            return false;
        }

        protected virtual void OnPropertyChanging(string propertyName, object value)
        {
            PropertyChanging?.Invoke(this, new PropertyChangingEventArgs(propertyName));
        }

        protected virtual void OnPropertyChanged(string propertyName, object value)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public override string ToString()
        {
            if (!string.IsNullOrWhiteSpace(Title))
            {
                return Title;
            }
            return Id.ToString();
        }
        #endregion
    }
}
