package ecommerce.interprog_finals.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file selected");
        }
        try {
            // Ensure upload directory exists
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            // Clean filename
            String originalFilenameRaw = file.getOriginalFilename();
            String originalFilename = StringUtils.cleanPath(originalFilenameRaw != null ? originalFilenameRaw : "uploaded_file");
            String filename = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = Paths.get(uploadDir, filename);
            Files.copy(file.getInputStream(), filePath);

            // Build relative file path for frontend use
            String fileRelativePath = "/uploads/" + filename;
            // create a new map to hold the response data
            Map<String, String> response = new HashMap<>();
            response.put("url", fileRelativePath);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed");
        }
    }
}
