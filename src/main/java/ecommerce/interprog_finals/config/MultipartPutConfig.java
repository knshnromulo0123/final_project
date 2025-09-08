package ecommerce.interprog_finals.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.HiddenHttpMethodFilter;

@Configuration
public class MultipartPutConfig {
    @Bean
    public HiddenHttpMethodFilter hiddenHttpMethodFilter() {
        return new HiddenHttpMethodFilter();
    }
}
