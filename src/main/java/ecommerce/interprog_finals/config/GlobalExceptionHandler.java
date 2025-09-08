package ecommerce.interprog_finals.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllExceptions(Exception ex, HttpServletRequest request) {
        System.err.println("Exception at " + request.getRequestURI() + ": " + ex.getMessage());
        ex.printStackTrace();
        return new ResponseEntity<>("Error: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDenied(Exception ex, HttpServletRequest request) {
        System.err.println("403 Forbidden at " + request.getRequestURI() + ": " + ex.getMessage());
        return new ResponseEntity<>("Forbidden: " + ex.getMessage(), HttpStatus.FORBIDDEN);
    }
}
