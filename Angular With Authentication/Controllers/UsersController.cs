using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
namespace Angular_With_Authentication.Controllers
{
    [Route("api/[controller]/[action]")]
    public class UsersController : Controller
    {
        private readonly Services.JwtSettings _jwtSettings;
        private readonly UserManager<Models.ApplicationUser> _userManager;
        private readonly SignInManager<Models.ApplicationUser> _signInManager;
        private readonly Services.IMessageService _messageService;
        private readonly Services.IRecaptchaService _recaptchaService;

        public UsersController(UserManager<Models.ApplicationUser> userManager, SignInManager<Models.ApplicationUser> signInManager, Services.IMessageService messageService, Services.IRecaptchaService recaptchaService, IOptions<Services.JwtSettings> jwtOptions)
        {
            _jwtSettings = jwtOptions.Value;
            _userManager = userManager;
            _signInManager = signInManager;
            _messageService = messageService;
            _recaptchaService = recaptchaService;
        }

        /// <summary>
        /// The user wants to log in with an external provider.
        /// </summary>
        /// <param name="id">The id of the external provider to use.</param>
        /// <param name="returnUrl">The route url to return to after successful external authentication.</param>
        /// <returns>A <see cref="ChallengeResult"></see> object for the external provider authentication.</returns>
        [HttpPost]
        public IActionResult ExternalSignIn(string id, string returnUrl)
        {
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(id, $"/api/Users/ExternalSignInCallback?returnUrl={WebUtility.UrlEncode(returnUrl)}");

            return Challenge(properties, id);
        }

        public async Task<IActionResult> ExternalSignInCallback(string returnUrl)
        {
            Models.ApplicationUser user;

            // get the details from the external provider
            var externalLoginInfo = await _signInManager.GetExternalLoginInfoAsync();

            // try and sign in using these external details
            var result = await _signInManager.ExternalLoginSignInAsync(externalLoginInfo.LoginProvider, externalLoginInfo.ProviderKey, false);

            // was the log in successful?
            if (!result.Succeeded)
            {
                // create the user for this login
                user = new Models.ApplicationUser
                {
                    Email = externalLoginInfo.Principal.FindFirstValue(ClaimTypes.Email),
                    EmailConfirmed = true,
                    IsExternal = true,
                    UserName = externalLoginInfo.LoginProvider + externalLoginInfo.ProviderKey
                };

                // create the identity for this user
                var identityResult = await _userManager.CreateAsync(user);
                if (!identityResult.Succeeded) return new StatusCodeResult(500);

                // add the external login
                identityResult = await _userManager.AddLoginAsync(user, externalLoginInfo);
                if (!identityResult.Succeeded) return new StatusCodeResult(500);

                // sign the user in
                await _signInManager.SignInAsync(user, false);
            } else
            {
                user = await _userManager.FindByLoginAsync(externalLoginInfo.LoginProvider, externalLoginInfo.ProviderKey);
            }

            // create a JWT token for this user
            var jwtToken = GenerateJwtToken(user);

            // redirect the user to the external login route
            return LocalRedirect($"/external?returnUrl={ returnUrl }&token={ jwtToken }");
        }

        private string GenerateJwtToken(Models.ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.NameId, user.Id)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(_jwtSettings.ExpireDays);

            var token = new JwtSecurityToken(
                _jwtSettings.Issuer,
                _jwtSettings.Issuer,
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<IActionResult> GetByEmail(string email)
        {
            // get the user
            var user = await _userManager.FindByEmailAsync(email);
            
            // return the user
            return Ok(Mapper.Map<Models.UserModel>(user));
        }

        /// <summary>
        /// Retrieve a user record by their username.
        /// </summary>
        /// <param name="email">The username to search for.</param>
        /// <returns>A <see cref="Models.UserModel"/> if a user exists with the specified username.  Otherwise, returns null.</returns>
        public async Task<IActionResult> GetByUserName(string email)
        {
            // try and get the user
            var user = await _userManager.FindByNameAsync(email);

            return Ok(Mapper.Map<Models.UserModel>(user));
        }

        [HttpPost]
        public async Task<IActionResult> GetCurrent()
        {
            // has the user authenticated?
            if (!User.Identity.IsAuthenticated) return Ok();

            // get the current user
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            return Ok(Mapper.Map<Models.UserModel>(user));
        }

        [HttpPost]
        public async Task<IActionResult> NewPassword([FromBody] Models.NewPasswordModel model)
        {
            // confirm the recaptcha verification
            if (!await _recaptchaService.VerifyAsync(model.Recaptcha)) return new BadRequestResult();

            // get the user
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null) return new OkResult();

            // now reset the password
            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.Password);
            if (!result.Succeeded) return new BadRequestObjectResult(result.Errors.First().Description);

            // add a JWT token to the response
            AddJwtTokenToResponse(user);

            return new OkResult();
        }

        public async Task<IActionResult> Register([FromBody] Models.RegisterUserModel model)
        {
            // confirm the recaptcha verification
            if (!await _recaptchaService.VerifyAsync(model.Recaptcha)) return BadRequest();

            // create the new user
            var newUser = new Models.ApplicationUser { Email = model.Email, IsExternal=false, UserName = model.Email };

            // add them to the database
            var result = await _userManager.CreateAsync(newUser, model.Password);
            if (!result.Succeeded) return new BadRequestObjectResult(result.Errors.First().Description);

            // send the confirmation email
            await SendConfirmationEmail(newUser);

            return new OkObjectResult(Mapper.Map<Models.UserModel>(newUser));
        }

        public async Task<IActionResult> ResetPassword([FromBody] Models.ResetPasswordModel model)
        {
            // confirm the recaptcha verification
            if (!await _recaptchaService.VerifyAsync(model.Recaptcha)) return new BadRequestResult();

            // get the user being reset
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return new OkResult();

            // generate the token to reset the email address
            var resetPasswordToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetPasswordUrl = $"{ this.GetRequestUri().GetLeftPart(UriPartial.Authority) }/newpassword?token={ resetPasswordToken }&userId={ user.Id }";

            // now send the email
            await _messageService.Send(user.Email, "Reset your password", $"Click <a href=\"{resetPasswordUrl}\">here</a> to reset your password");

            return new OkResult();
        }

        private async Task SendConfirmationEmail(Models.ApplicationUser newUser)
        {
            // get the token to confirm the email address
            var emailConfirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);
            var tokenVerificationUrl = Url.Action("Confirm", "Users", new { id = newUser.Id, token = emailConfirmationToken }, Request.Scheme);
            
            // now send the email
            await _messageService.Send(newUser.Email, "Verify your email address", $"Click <a href=\"{tokenVerificationUrl}\">here</a> to verify your email");
        }

        public async Task<IActionResult> SignIn([FromBody] Models.SignInUserModel model)
        {
            // get the user
            var identity = await _userManager.FindByEmailAsync(model.Email);
            if (identity == null) return new OkResult();

            // try and sign the user in
            var result = await _signInManager.PasswordSignInAsync(identity, model.Password, false, true);
            if (!result.Succeeded) return new OkResult();

            // add a JWT token to the response
            AddJwtTokenToResponse(identity);

            return new OkObjectResult(Mapper.Map<Models.UserModel>(identity));
        }

        [Authorize]
        [HttpPost]
        public async Task SignOut()
        {
            await _signInManager.SignOutAsync();
        }

        private void AddJwtTokenToResponse(Models.ApplicationUser identity)
        {
            // generate the Jwt token for this user
            var jwtToken = GenerateJwtToken(identity);

            // send it back in the response
            Response.Headers.Add("X-JWT", jwtToken);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> ChangePassword([FromBody] Models.ChangePasswordModel model)
        {
            // get the user to be updated
            var user = await _userManager.FindByNameAsync(User.Identity.Name);

            // now change the password
            var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
            if (!result.Succeeded) return new BadRequestObjectResult(result.Errors.First().Description);

            return new OkResult();
        }

        public async Task<IActionResult> Confirm(string id, string token)
        {
            // get the user
            var newUser = await _userManager.FindByIdAsync(id);

            // if the user's email is already confirmed, no need to do it again
            if (!newUser.EmailConfirmed)
            {
                // confirm the email
                var result = await _userManager.ConfirmEmailAsync(newUser, token);

                // if the confirmation failed, show the failure message
                if (!result.Succeeded) return View();
            }

            // redirect the user to the confirmed page
            return new LocalRedirectResult("~/confirmed", false);
        }

        public async Task<IActionResult> ResendConfirmationEmail([FromBody] Models.ResendConfirmationEmailModel model)
        {
            // confirm the recaptcha verifications
            if (!await _recaptchaService.VerifyAsync(model.Recaptcha)) return new BadRequestResult();

            // get the user
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return new BadRequestResult();

            // send the ocnfirmation email
            await SendConfirmationEmail(user);

            return new OkResult();
        }
    }
}
