using SP.Client.Linq;
using SP.Client.Linq.Model;
using System;
using System.Collections.Generic;

namespace LinqToSP.Test.Model
{
    public class DbContext : EFContext
    {
        protected override ICollection<Type> GetMapTypes()
        {
            return new[] { typeof(DepartmentMap) };
        }
    }
}
