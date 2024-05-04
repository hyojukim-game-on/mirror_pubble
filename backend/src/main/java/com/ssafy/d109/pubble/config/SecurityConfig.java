package com.ssafy.d109.pubble.config;

import com.ssafy.d109.pubble.repository.RefreshTokenRepository;
import com.ssafy.d109.pubble.repository.UserRepository;
import com.ssafy.d109.pubble.security.filter.CustomLogoutFilter;
import com.ssafy.d109.pubble.security.filter.JWTFilter;
import com.ssafy.d109.pubble.security.filter.LoginFilter;
import com.ssafy.d109.pubble.security.jwt.JWTUtil;
import com.ssafy.d109.pubble.util.CommonUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JWTUtil jwtUtil;
    private RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;


    public SecurityConfig(AuthenticationConfiguration authenticationConfiguration, JWTUtil jwtUtil,RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf((auth) -> auth.disable());
        http.formLogin((auth) -> auth.disable());
        http.httpBasic((auth) -> auth.disable());
//        http.logout((logout) -> logout.disable());

        http.authorizeHttpRequests((auth) -> auth
                .requestMatchers("/hash", "/api/users/**","/api/hash","/api/projects/**","/api-docs/**", "/v3/**","api/api-docs/**", "/api/v3/**").permitAll()
                .requestMatchers("/api/admin").hasRole("ADMIN")
                .anyRequest().authenticated());

        http.addFilterBefore(new JWTFilter(jwtUtil), LoginFilter.class);

        // 로그인 경로 수정
        LoginFilter loginFilter = new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil,refreshTokenRepository, userRepository);
        loginFilter.setFilterProcessesUrl("/api/users/signin");
        http.addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class);
        loginFilter.setFilterProcessesUrl("/api/users/signin");
        http
                .addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class);

        // 로그아웃 경로 수정
        http.logout((logout) -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/api/users/logout"))
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true));


        http
                .addFilterBefore(new CustomLogoutFilter(jwtUtil, refreshTokenRepository), LogoutFilter.class);

        http
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.cors((c) -> c.configurationSource(new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(Collections.singletonList(System.getenv("FRONT_BASE")));
                configuration.setAllowedOrigins(Collections.singletonList(System.getenv("FRONT_LOCAL")));
//                configuration.setAllowedOrigins(Collections.singletonList(System.getenv("FRONT_BASE_TWO")));
                configuration.setAllowedMethods(Collections.singletonList("*"));
                configuration.setAllowCredentials(true);
                configuration.setAllowedHeaders(Collections.singletonList("*"));
                configuration.setMaxAge(3600L);

                configuration.setExposedHeaders(Collections.singletonList("Authorization"));

                return configuration;
            }
        }));

        return http.build();
    }

}