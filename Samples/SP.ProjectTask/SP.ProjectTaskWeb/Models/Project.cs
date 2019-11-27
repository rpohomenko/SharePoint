using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.Client.Linq.Attributes;
using SP.Client.Linq.Provisioning;
using System.Collections.Generic;
using System.Linq;

namespace SP.ProjectTaskWeb.Models
{
    [ContentType(Name = "Project", Id = "0x0100E38E1DCF11EC46CE9AE771A9423B8AAD", Level = ProvisionLevel.List, Behavior = ProvisionBehavior.Default)]
    [List(Title = "Projects", Url = "Lists/Projects", Behavior = ProvisionBehavior.Default)]
    public class Project : Entity
    {
        private readonly SpEntitySet<ProjectTask> _tasks;

        public Project()
        {
            ManagerLookup = new SpEntityLookupCollection<Employee>();
            DeveloperLookup = new SpEntityLookupCollection<Employee>();
            TesterLookup = new SpEntityLookupCollection<Employee>();
            _tasks = new SpEntitySet<ProjectTask>();
        }

        public ISpEntitySet<ProjectTask> Tasks
        {
            get
            {
                return _tasks.Where(task => task.ProjectLookup == (object)this.Id).ToEntitySet();
            }
        }

        public override string ContentTypeId
        {
            get
            {
                if (string.IsNullOrEmpty(base.ContentTypeId))
                {
                    base.ContentTypeId = "0x0100E38E1DCF11EC46CE9AE771A9423B8AAD";
                }
                return base.ContentTypeId;
            }
            set => base.ContentTypeId = value;
        }

        [LookupField(Name = "pt_Manager", Title = "Manager", IsMultiple = true, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookupCollection<Employee> ManagerLookup
        {
            get;
        }
        public ICollection<Employee> Managers
        {
            get
            {
                return ManagerLookup.GetEntities();
            }
            set
            {
                ManagerLookup.SetEntities(value);
            }
        }

        [LookupField(Name = "pt_Developer", Title = "Developer", IsMultiple = true, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookupCollection<Employee> DeveloperLookup
        {
            get;
        }
        public ICollection<Employee> Developers
        {
            get
            {
                return DeveloperLookup.GetEntities();
            }
            set
            {
                DeveloperLookup.SetEntities(value);
            }
        }


        [LookupField(Name = "pt_Tester", Title = "Tester", IsMultiple = true, Behavior = ProvisionBehavior.Overwrite)]
        public ISpEntityLookupCollection<Employee> TesterLookup
        {
            get;
        }
        public ICollection<Employee> Testers
        {
            get
            {
                return TesterLookup.GetEntities();
            }
            set
            {
                TesterLookup.SetEntities(value);
            }
        }

    }
}