using Microsoft.SharePoint.Client;
using SP.Client.Linq;
using SP.ProjectTaskWeb.Models;
using System.Collections.Generic;

namespace SP.ProjectTaskWeb
{
    public static class Extensions
    {
        public static bool LookupIdIncludes(this IEnumerable<int> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdIncludes(this IEnumerable<FieldLookupValue> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdIncludes(this ISpEntityLookupCollection<Department> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdIncludes(this ISpEntityLookupCollection<Employee> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdIncludes(this ISpEntityLookupCollection<Project> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdIncludes(this ISpEntityLookupCollection<ProjectTask> lookupField, int lookupId)
        {
            return false;
        }

        public static bool LookupIdNotIncludes(this IEnumerable<int> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdNotIncludes(this IEnumerable<FieldLookupValue> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdNotIncludes(this ISpEntityLookupCollection<Department> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdNotIncludes(this ISpEntityLookupCollection<Employee> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdNotIncludes(this ISpEntityLookupCollection<Project> lookupField, int lookupId)
        {
            return false;
        }
        public static bool LookupIdNotIncludes(this ISpEntityLookupCollection<ProjectTask> lookupField, int lookupId)
        {
            return false;
        }

        public static bool Includes(this FieldLookupValue lookupField, params int[] lookupIds)
        {
            return false;
        }
        public static bool Includes(this ISpEntityLookup<Department> lookupField, params int[] lookupIds)
        {
            return false;
        }
        public static bool Includes(this ISpEntityLookup<Employee> lookupField, params int[] lookupIds)
        {
            return false;
        }

        public static bool Includes(this ISpEntityLookup<Project> lookupField, params int[] lookupIds)
        {
            return false;
        }
        public static bool Includes(this ISpEntityLookup<ProjectTask> lookupField, params int[] lookupIds)
        {
            return false;
        }

        public static bool Equals(this ISpEntityLookup<ProjectTask> lookupField, int lookupId)
        {
            return object.Equals(lookupField, lookupId);
        }

        public static bool NotEquals(this ISpEntityLookup<ProjectTask> lookupField, int lookupId)
        {
            return lookupField != null ? lookupField.NotEquals(lookupId) : lookupId > 0;
        }

        public static bool Equals(this ISpEntityLookup<Project> lookupField, int lookupId)
        {
            return object.Equals(lookupField, lookupId);
        }

        public static bool NotEquals(this ISpEntityLookup<Project> lookupField, int lookupId)
        {
            return lookupField != null ? lookupField.NotEquals(lookupId) : lookupId > 0;
        }

        public static bool Equals(this ISpEntityLookup<Employee> lookupField, int lookupId)
        {
            return object.Equals(lookupField, lookupId);
        }

        public static bool NotEquals(this ISpEntityLookup<Employee> lookupField, int lookupId)
        {
            return lookupField != null ? lookupField.NotEquals(lookupId) : lookupId > 0;
        }

        public static bool Equals(this ISpEntityLookup<Department> lookupField, int lookupId)
        {
            return object.Equals(lookupField, lookupId);
        }

        public static bool NotEquals(this ISpEntityLookup<Department> lookupField, int lookupId)
        {
            return lookupField != null ? lookupField.NotEquals(lookupId) : lookupId > 0;
        }

        public static bool Equals(this FieldLookupValue lookupField, int lookupId)
        {
            return object.Equals(lookupField, lookupId);
        }
      
        public static bool NotEquals(this FieldLookupValue lookupField, int lookupId)
        {
            return lookupField != null ? lookupField.NotEquals(lookupId) : lookupId > 0;
        }
    }
}