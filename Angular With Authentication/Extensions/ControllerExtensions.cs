using Microsoft.AspNetCore.Http.Extensions;
using System;

namespace Microsoft.AspNetCore.Mvc
{
    public static class ControllerExtensions
    {
        public static Uri GetRequestUri(this Controller controller)
        {
            return new Uri(controller.Request.GetEncodedUrl());
        }
    }
}