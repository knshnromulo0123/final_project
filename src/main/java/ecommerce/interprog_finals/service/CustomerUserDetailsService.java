package ecommerce.interprog_finals.service;

import ecommerce.interprog_finals.entity.Customer;
import ecommerce.interprog_finals.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Service
public class CustomerUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    public CustomerUserDetailsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return new org.springframework.security.core.userdetails.User(
            customer.getEmail(),
            customer.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority("USER"))
        );
    }
}