using System;
using System.Net;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.SharePoint.Client;

namespace SP.Client.Extensions
{
    public static class ClientRuntimeContextExtentions
    {
        public static async Task ExecuteQueryAsync(this ClientRuntimeContext clientContext)
        {
            await Task.Run(() =>
            {
                lock (clientContext)
                {
                    if (clientContext.HasPendingRequest)
                    {
                        clientContext.ExecuteQuery();
                    }
                }
            });
        }

        public static async Task ExecuteQueryAsync(this ClientRuntimeContext clientContext, Action onSucceed,
            Action<Exception> onFailed)
        {
            try
            {
                await ExecuteQueryAsync(clientContext);
                onSucceed?.Invoke();
            }
            catch (Exception ex)
            {
                if (onFailed != null)
                {
                    onFailed(ex);
                }
                else
                {
                    throw;
                }
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="clientContext"></param>
        /// <param name="retryCount">Number of times to retry the request</param>
        /// <param name="delay">Milliseconds to wait before retrying the request. The delay will be increased (doubled) every retry</param>
        public static void ExecuteQueryRetry(this ClientRuntimeContext clientContext, int retryCount = 10, int delay = 500)
        {
            var clientTag = string.Empty;
            //if (clientContext is SPClientContext)
            //{
            //    retryCount = (clientContext as SPClientContext).RetryCount;
            //    delay = (clientContext as SPClientContext).Delay;
            //    clientTag = (clientContext as SPClientContext).ClientTag;
            //}

            int retryAttempts = 0;
            if (retryCount <= 0)
                retryCount = 1;
                //throw new ArgumentException("Provide a retry count greater than zero.");

            if (delay <= 0)
                delay = 1;
                //throw new ArgumentException("Provide a delay greater than zero.");

                // Do while retry attempt is less than retry count
            while (retryAttempts < retryCount)
            {
                try
                {
                    // ClientTag property is limited to 32 chars
                    if (clientTag.Length > 32)
                    {
                        clientTag = clientTag.Substring(0, 32);
                    }
                    clientContext.ClientTag = clientTag;

                    // Make CSOM request more reliable by disabling the return value cache. Given we 
                    // often clone context objects and the default value is
//#if !ONPREMISES
//                    //clientContext.DisableReturnValueCache = true;
//#elif SP2016
//                    //clientContext.DisableReturnValueCache = true;
//#endif                
                    // DO NOT CHANGE THIS TO EXECUTEQUERYRETRY
                    clientContext.ExecuteQuery();
                    return;
                }
                catch (WebException wex)
                {
                    var response = wex.Response as HttpWebResponse;
                    // Check if request was throttled - http status code 429
                    // Check is request failed due to server unavailable - http status code 503
                    if (response != null && (response.StatusCode == (HttpStatusCode)429 || response.StatusCode == (HttpStatusCode)503))
                    {
                        //Add delay for retry
                        Thread.Sleep(delay);

                        //Add to retry count and increase delay.
                        retryAttempts++;
                        delay = delay * 2;
                    }
                    else
                    {
                        throw;
                    }
                }
            }
            throw new MaximumRetryAttemptedException($"Maximum retry attempts {retryCount}, has be attempted.");
        }


        /// <summary>
        /// Clones a ClientContext object while "taking over" the security context of the existing ClientContext instance
        /// </summary>
        /// <param name="clientContext">ClientContext to be cloned</param>
        /// <param name="siteUrl">Site url to be used for cloned ClientContext</param>
        /// <returns>A ClientContext object created for the passed site url</returns>
        public static ClientContext Clone(this ClientRuntimeContext clientContext, Uri siteUrl)
        {
            if (siteUrl == null)
            {
                throw new ArgumentException("siteUrl");
            }

            ClientContext clonedClientContext = new ClientContext(siteUrl)
            {
                AuthenticationMode = clientContext.AuthenticationMode,
                ClientTag = clientContext.ClientTag,
                //DisableReturnValueCache = clientContext.DisableReturnValueCache
            };
//#if !ONPREMISES
//#elif SP2016
//            //clonedClientContext.DisableReturnValueCache = clientContext.DisableReturnValueCache;
//#endif


            // In case of using networkcredentials in on premises or SharePointOnlineCredentials in Office 365
            if (clientContext.Credentials != null)
            {
                clonedClientContext.Credentials = clientContext.Credentials;
            }
            else
            {
                //Take over the form digest handling setting
                clonedClientContext.FormDigestHandlingEnabled = (clientContext as ClientContext).FormDigestHandlingEnabled;

                // In case of app only or SAML
                clonedClientContext.ExecutingWebRequest += delegate (object oSender, WebRequestEventArgs webRequestEventArgs)
                {
                    // Call the ExecutingWebRequest delegate method from the original ClientContext object, but pass along the webRequestEventArgs of 
                    // the new delegate method
                    MethodInfo methodInfo = clientContext.GetType().GetMethod("OnExecutingWebRequest", BindingFlags.Instance | BindingFlags.NonPublic);
                    object[] parametersArray = { webRequestEventArgs };
                    methodInfo.Invoke(clientContext, parametersArray);
                };
            }

            return clonedClientContext;
        }
    }

    /// <summary>
    /// Defines a Maximum Retry Attemped Exception
    /// </summary>
    [Serializable]
    public class MaximumRetryAttemptedException : Exception
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="message"></param>
        public MaximumRetryAttemptedException(string message)
            : base(message)
        {

        }
    }
}