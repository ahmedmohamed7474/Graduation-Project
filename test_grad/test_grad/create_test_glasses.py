from PIL import Image, ImageDraw

# Create a new image with transparent background
width = 800
height = 300
image = Image.new('RGBA', (width, height), (255, 255, 255, 0))
draw = ImageDraw.Draw(image)

# Draw glasses frame
frame_color = (0, 0, 0, 255)  # Black with full opacity
lens_color = (0, 0, 0, 64)    # Black with some transparency

# Left lens
draw.ellipse([100, 100, 300, 200], fill=lens_color, outline=frame_color, width=3)
# Right lens
draw.ellipse([500, 100, 700, 200], fill=lens_color, outline=frame_color, width=3)
# Bridge
draw.line([300, 150, 500, 150], fill=frame_color, width=3)
# Temple arms
draw.line([100, 150, 50, 130], fill=frame_color, width=3)  # Left temple
draw.line([700, 150, 750, 130], fill=frame_color, width=3) # Right temple

# Save the image
image.save('d:/projects/gradproj/test_grad/test_grad/glasses_images/test_glasses.png', 'PNG')
