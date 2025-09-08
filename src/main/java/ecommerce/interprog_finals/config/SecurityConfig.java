package ecommerce.interprog_finals.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**") 
                .disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/api/users/register",
                    "/api/users/login",
                    "/api/admin/login",
                    "/admin/**",
                    "/css/**",
                    "/js/**",
                    "/Images/**",
                    "/images/**",
                    "/admin/img/**",
                    "/uploads/**",
                    "/*.html",
                    "/admin/*.html",
                    "/admin/js/**",
                    "/favicon.ico",
                    "/index.html",
                    "/login.html",
                    "/products.html",
                    "/cart.html",
                    "/checkout.html",
                    "/order-confirmation.html",
                    "/profile.html",
                    "/product-details.html",
                    "/styles/**",
                    "/js/**",
                    "/images/**",
                    "/static/**",
                    "/placeholders/**"
                ).permitAll()
                // Permit all for product API
                .requestMatchers("/api/products", "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/upload").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/api/upload").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/me").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/featured").permitAll()
                
                .requestMatchers("/api/products/{id}/update","/api/products/*/update").permitAll()
                .requestMatchers("/api/customers", "/api/customers/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(org.springframework.security.config.Customizer.withDefaults())
            .httpBasic(httpBasic -> httpBasic.disable());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
