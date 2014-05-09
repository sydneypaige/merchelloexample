﻿namespace MerchKit.Models
{
    /// <summary>
    /// Simple model used for deserializing Related Links JSON
    /// </summary>
    public class RelatedLink
    {
        public string Caption { get; set; } 
        public string Link { get; set; }
        public bool NewWindow { get; set; }
        public int Internal { get; set; }
        public bool IsInternal { get; set; }
        public bool Edit { get; set; }
        public string InternalName { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
    }
}