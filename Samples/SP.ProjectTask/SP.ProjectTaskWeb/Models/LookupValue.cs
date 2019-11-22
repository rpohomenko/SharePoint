using System.Runtime.Serialization;

namespace SP.ProjectTaskWeb.Models
{
    [DataContract]
    public class LookupValue
    {
        [DataMember]
        public int Id { get; set; }
        [DataMember]
        public string Value { get; set; }
    }
}