using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
namespace Angular_With_Authentication
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // add services required for using options
            services.AddOptions();

            // add Automapper
            services.AddAutoMapper();

            // register the Recaptcha configuration
            services.Configure<Services.JwtSettings>(Configuration.GetSection("Jwt"));
            services.Configure<Services.RecaptchaSettings>(Configuration.GetSection("Recaptcha"));
            services.Configure<Services.SendGridSettings>(Configuration.GetSection("SendGrid"));
            
            // register identity providers
            services.AddDbContext<Models.ApplicationDbContext>(options =>
            {
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"), optionsBuilder => optionsBuilder.MigrationsAssembly("AngularWithAuthentication"));
            });
            services.AddIdentity<Models.ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<Models.ApplicationDbContext>()
                .AddDefaultTokenProviders();

            // configure the identity options
            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequiredLength = 6;                                // the password must be at least 6 characters long
                options.Password.RequireLowercase = false;                          // no lowercase characters are required
                options.Password.RequireNonAlphanumeric = false;                    // digits and/or numbers is enough
                options.Password.RequireUppercase = false;                          // no uppercase characters are required

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);  // users will be locked out for 30 minutes
                options.Lockout.MaxFailedAccessAttempts = 10;                       // users get 10 sign in attempts before they are locked out

                options.User.RequireUniqueEmail = false;                            // emails can be deleted - this allows users to sign on with different external providers that have the same email address

            });

            services.AddAuthentication(cfg => {
                cfg.DefaultScheme = IdentityConstants.ApplicationScheme;
                cfg.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddFacebook(cfg =>
            {
                cfg.AppId = Configuration["FacebookId"];
                cfg.AppSecret = Configuration["FacebookSecret"];
            })
            .AddJwtBearer(cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
            });

            services.AddMvc();

            // add custom service
            services.AddTransient<Services.IMessageService, Services.SendGridMessageService>();
            services.AddTransient<Services.IRecaptchaService, Services.RecaptchaService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });

                var dbContext = serviceProvider.GetService<Models.ApplicationDbContext>();
                dbContext.Database.Migrate();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            // use Microsoft Identity
            app.UseAuthentication();

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
        }
    }
}
