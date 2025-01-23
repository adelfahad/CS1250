import random
import string
from barcode import Code128
from barcode.writer import ImageWriter

def generate_unique_code(length=10):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def create_barcode(code, output_file):
   
    try:
        barcode = Code128(code, writer=ImageWriter())
        barcode.save(output_file)
    except Exception as e:
        print(f"Error while creating barcode: {e}")

def main():
    unique_code = generate_unique_code()
    print(f"Generated Unique Code: {unique_code}")

    output_file = f"barcode_{1}"
    create_barcode(unique_code, output_file)
    print(f"Barcode saved as {output_file}.png")

if __name__ == "__main__":
    main()
