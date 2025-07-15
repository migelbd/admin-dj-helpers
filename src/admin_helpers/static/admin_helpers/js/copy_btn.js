document.addEventListener('DOMContentLoaded', function() {
    // Handle copy functionality for inline copy buttons
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // Check if clicked element has copy-inline-button class
        if (target.classList.contains('copy-inline-button') && !target.classList.contains('copying')) {
            const valueToCopy = target.getAttribute('data-value-to-copy');

            
            if (valueToCopy) {
                // Copy to clipboard
                copyToClipboard(valueToCopy, target);
            }
        }
    });
    
    function copyToClipboard(text, element) {
        // Store original text and dimensions
        const originalText = element.textContent;
        const computedStyle = window.getComputedStyle(element);
        element.style.width = computedStyle.width;

        element.style.display = 'inline-block';
        element.style.textAlign = 'center';
        element.style.transition = 'opacity 0.3s ease';

        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function() {
                showCopiedMessage(element, originalText);
            }).catch(function() {
                // Fallback to older method
                fallbackCopyToClipboard(text, element, originalText);
            });
        } else {
            // Fallback for older browsers or non-secure contexts
            fallbackCopyToClipboard(text, element, originalText);
        }
    }
    
    function fallbackCopyToClipboard(text, element, originalText) {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        try {
            textarea.select();
            textarea.setSelectionRange(0, 99999); // For mobile devices
            const successful = document.execCommand('copy');
            
            if (successful) {
                showCopiedMessage(element, originalText);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        } finally {
            document.body.removeChild(textarea);
        }
    }
    
    function showCopiedMessage(element, originalText) {
        // Fade out current text
        element.style.opacity = '0.3';
        
        setTimeout(function() {
            // Change text to "Скопировано"
            element.textContent = 'Скопировано';
            
            // Fade in new text
            element.style.opacity = '1';
            element.classList.add('copying');
            
            // Restore original text after 2 seconds
            setTimeout(function() {
                element.style.opacity = '0.3';
                
                setTimeout(function() {
                    element.textContent = originalText;
                    element.style.opacity = '1';
                    element.classList.remove('copying');
                    
                    // Remove fixed dimensions after animation
                    setTimeout(function() {
                        element.style.width = '';
                        element.style.height = '';
                        element.style.display = '';
                        element.style.textAlign = '';
                        element.style.transition = '';
                    }, 300);
                }, 150);
            }, 800);
        }, 150);
    }
});