import argparse
import sys
import os
import glob # For finding files
import re # For comment removal
from bs4 import BeautifulSoup, Comment # Added Comment
# from cssmin import cssmin # Removed
# from jsmin import jsmin, JavascriptMinify # Removed
import jsbeautifier # Added

def remove_html_comments(soup):
    """Removes all HTML comments from a BeautifulSoup object."""
    comments_removed_count = 0
    for comment_tag in soup.find_all(string=lambda text: isinstance(text, Comment)):
        comment_tag.extract()
        comments_removed_count += 1
    return comments_removed_count

def remove_css_comments(css_code):
    """Removes CSS comments (/* ... */)."""
    # Remove block comments
    original_length = len(css_code)
    cleaned_code = re.sub(r'/\*.*?\*/', '', css_code, flags=re.DOTALL)
    return cleaned_code, original_length != len(cleaned_code)

def remove_js_comments(js_code):
    """Removes JavaScript comments (// ... and /* ... */)."""
    original_length = len(js_code)
    # Remove block comments
    code_no_block_comments = re.sub(r'/\*.*?\*/', '', js_code, flags=re.DOTALL)
    # Remove single-line comments that are not part of a string or regex
    # This is a simplified approach; a more robust parser would be better for edge cases.
    cleaned_code = re.sub(r'//.*?$', '', code_no_block_comments, flags=re.MULTILINE)
    # Strip empty lines that might result from comment removal
    cleaned_code = "\n".join([line for line in cleaned_code.splitlines() if line.strip()])
    return cleaned_code, original_length != len(cleaned_code)

def beautify_css_content(css_code):
    """Beautifies CSS content using jsbeautifier.cssbeautify."""
    try:
        opts = jsbeautifier.default_options()
        # Configure options if needed, e.g., opts.indent_size = 2
        return jsbeautifier.css(css_code, opts)
    except Exception as e:
        print(f"Warning: Could not beautify CSS. Error: {e}", file=sys.stderr)
        return css_code

def beautify_js_content(js_code):
    """Beautifies JavaScript content using jsbeautifier.beautify."""
    try:
        opts = jsbeautifier.default_options()
        # Configure options if needed, e.g., opts.indent_size = 2
        return jsbeautifier.js(js_code, opts)
    except Exception as e:
        print(f"Warning: Could not beautify JavaScript. Error: {e}", file=sys.stderr)
        return js_code

def process_html_file(filepath):
    """
    Reads an HTML file, removes comments, beautifies inline CSS and JavaScript,
    and overwrites the original file.
    """
    print(f"Processing HTML file '{filepath}'...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.", file=sys.stderr)
        return
    except Exception as e:
        print(f"Error reading file '{filepath}': {e}", file=sys.stderr)
        return

    soup = BeautifulSoup(html_content, 'html.parser')
    changes_made = False
    
    # Remove HTML comments
    html_comments_removed = remove_html_comments(soup)
    if html_comments_removed > 0:
        changes_made = True
        print(f"Removed {html_comments_removed} HTML comment(s) from '{filepath}'.")

    # Beautify inline CSS in <style> tags
    style_tags_processed = 0
    for style_tag in soup.find_all('style'):
        if style_tag.string:
            original_css = style_tag.string
            cleaned_css, comments_were_removed_css = remove_css_comments(original_css)
            beautified_css = beautify_css_content(cleaned_css)
            if beautified_css != original_css or comments_were_removed_css: # Check if beautification or comment removal changed content
                style_tag.string.replace_with(beautified_css)
                style_tags_processed +=1
                changes_made = True

    # Beautify inline JavaScript in <script> tags (excluding those with a 'src' attribute)
    script_tags_processed = 0
    for script_tag in soup.find_all('script'):
        if not script_tag.has_attr('src') and script_tag.string:
            original_js = script_tag.string
            cleaned_js, comments_were_removed_js = remove_js_comments(original_js)
            beautified_js = beautify_js_content(cleaned_js)
            if beautified_js != original_js or comments_were_removed_js: # Check if beautification or comment removal changed content
                script_tag.string.replace_with(beautified_js)
                script_tags_processed +=1
                changes_made = True
    
    if not changes_made:
        print(f"No content changes (comments, inline CSS/JS beautification) in '{filepath}'. File unchanged.")
        return

    # Use prettify to format the HTML structure itself
    modified_html_content = soup.prettify(formatter="html5")

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(modified_html_content)
        print(f"Successfully processed and overwrote '{filepath}' (HTML comments removed: {html_comments_removed > 0}, Styles processed: {style_tags_processed}, Scripts processed: {script_tags_processed})")
    except Exception as e:
        print(f"Error writing (overwriting) file '{filepath}': {e}", file=sys.stderr)

def process_css_file(filepath):
    """Reads a CSS file, removes comments, beautifies it, and overwrites the original file."""
    print(f"Processing CSS file '{filepath}'...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            css_content = f.read()
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.", file=sys.stderr)
        return
    except Exception as e:
        print(f"Error reading file '{filepath}': {e}", file=sys.stderr)
        return

    original_content = css_content
    cleaned_css, comments_removed = remove_css_comments(css_content)
    beautified_css = beautify_css_content(cleaned_css)

    if beautified_css == original_content and not comments_removed:
        print(f"No changes (comments, beautification) made to '{filepath}'. File unchanged.")
        return

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(beautified_css)
        print(f"Successfully removed comments, beautified, and overwrote '{filepath}' (Comments removed: {comments_removed})")
    except Exception as e:
        print(f"Error writing (overwriting) file '{filepath}': {e}", file=sys.stderr)

def process_js_file(filepath):
    """Reads a JS file, removes comments, beautifies it, and overwrites the original file."""
    print(f"Processing JS file '{filepath}'...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            js_content = f.read()
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.", file=sys.stderr)
        return
    except Exception as e:
        print(f"Error reading file '{filepath}': {e}", file=sys.stderr)
        return

    original_content = js_content
    cleaned_js, comments_removed = remove_js_comments(js_content)
    beautified_js = beautify_js_content(cleaned_js)

    if beautified_js == original_content and not comments_removed:
        print(f"No changes (comments, beautification) made to '{filepath}'. File unchanged.")
        return
        
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(beautified_js)
        print(f"Successfully removed comments, beautified, and overwrote '{filepath}' (Comments removed: {comments_removed})")
    except Exception as e:
        print(f"Error writing (overwriting) file '{filepath}': {e}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(
        description=(
            'Beautifies and removes comments from HTML, CSS, and JS files by overwriting them. \\n'
            'For HTML files, inline CSS and JavaScript are also processed. \\n'
            'The script always searches recursively. If no path is provided, it processes files in the current directory and its subdirectories.\\n'
            'WARNING: This script directly modifies the input files. Make sure to backup your files before running.'
        ),
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        'input_path',
        nargs='?',  # Make input_path optional
        default='.',  # Default to current directory
        help='Path to the input file (HTML, CSS, JS) or a directory containing such files to be overwritten. Defaults to the current directory.'
    )
    # parser.add_argument(
    #     '--recursive',
    #     action='store_true',
    #     help='Recursively search for HTML, CSS, and JS files in subdirectories if input_path is a directory.'
    # )

    args = parser.parse_args()
    input_path = args.input_path

    supported_extensions = {'.html', '.htm', '.css', '.js'}

    if os.path.isfile(input_path):
        file_ext = os.path.splitext(input_path)[1].lower()
        if file_ext not in supported_extensions:
            print(f"Error: Input file '{input_path}' is not a supported type ({', '.join(supported_extensions)}).", file=sys.stderr)
            sys.exit(1)
        
        if file_ext in ['.html', '.htm']:
            process_html_file(input_path)
        elif file_ext == '.css':
            process_css_file(input_path)
        elif file_ext == '.js':
            process_js_file(input_path)

    elif os.path.isdir(input_path):
        print(f"Processing directory: '{os.path.abspath(input_path)}' recursively for in-place beautification and comment removal.")
        print("WARNING: Files in this directory and subdirectories will be overwritten.")
        
        patterns = []
        # Always recursive, so base_path always uses '**'
        base_path = os.path.join(input_path, '**')
        
        for ext in supported_extensions:
            patterns.append(os.path.join(base_path, f'*{ext}'))


        all_files_to_process = []
        for pattern in patterns:
            # For recursive globbing, the recursive=True flag must be passed to glob.glob
            # if the pattern contains '**'.
            # Since we are always recursive now, this is always true.
            found_files = glob.glob(pattern, recursive=True)
            all_files_to_process.extend(found_files)
        
        all_files_to_process = sorted(list(set(all_files_to_process))) # Remove duplicates

        if not all_files_to_process:
            print(f"No supported files ({', '.join(supported_extensions)}) found in '{input_path}' recursively.")
            sys.exit(0)

        for filepath_to_process in all_files_to_process:
            file_ext = os.path.splitext(filepath_to_process)[1].lower()
            if file_ext in ['.html', '.htm']:
                process_html_file(filepath_to_process)
            elif file_ext == '.css':
                process_css_file(filepath_to_process)
            elif file_ext == '.js':
                process_js_file(filepath_to_process)
        print(f"\nProcessed {len(all_files_to_process)} file(s).")
    else:
        print(f"Error: Input path '{input_path}' is not a valid file or directory.", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 