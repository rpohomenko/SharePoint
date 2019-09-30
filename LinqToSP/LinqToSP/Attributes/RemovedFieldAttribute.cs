using System;

namespace SP.Client.Linq.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public sealed class RemovedFieldAttribute : Attribute
    {
    }
}
