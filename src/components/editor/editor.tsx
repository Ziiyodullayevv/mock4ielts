'use client';

import type { EditorProps } from './types';

import { debounce } from 'es-toolkit';
import { common, createLowlight } from 'lowlight';
import { mergeClasses } from 'minimal-shared/utils';
import ImageExtension from '@tiptap/extension-image';
import StarterKitExtension from '@tiptap/starter-kit';
import TextAlignExtension from '@tiptap/extension-text-align';
import { Placeholder as PlaceholderExtension } from '@tiptap/extensions';
import { useMemo, useState, useEffect, useContext, useCallback } from 'react';
import CodeBlockLowlightExtension from '@tiptap/extension-code-block-lowlight';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';

import Box from '@mui/material/Box';
import Portal from '@mui/material/Portal';
import Backdrop from '@mui/material/Backdrop';
import FormHelperText from '@mui/material/FormHelperText';

import { EditorRoot } from './styles';
import { editorClasses } from './classes';
import { Toolbar } from './components/toolbar';
import { BubbleToolbar } from './components/bubble-toolbar';
import { CodeHighlightBlock } from './components/code-highlight-block';
import { useQuestionNumbering } from '../questions/question-numbering';
import { BlankNode, GlobalBlanksContext } from './extension/blank-node';
import { ClearFormat as ClearFormatExtension } from './extension/clear-format';
import { TextTransform as TextTransformExtension } from './extension/text-transform';

// ----------------------------------------------------------------------

// Convert stored blank formats to editor chips before setting content
function toEditorHtml(html: string): string {
  return html
    .replace(
      /<(?:b|strong)>\s*(\d+)\s*<\/(?:b|strong)>(?:\s|&nbsp;)*_{3,}/g,
      '<span data-blank="$1"></span>'
    )
    .replace(/___(\d+)___/g, '<span data-blank="$1"></span>');
}

// Convert editor chips to the requested storage format
function fromEditorHtml(html: string, format: EditorProps['blankOutputFormat']): string {
  const replacement = format === 'html' ? '<b>$1</b> _____' : '___$1___';

  return html.replace(/<span data-blank="(\d+)"[^>]*>[\s\S]*?<\/span>/g, replacement);
}

// ----------------------------------------------------------------------

export function Editor({
  sx,
  error,
  onChange,
  slotProps,
  helperText,
  resetValue,
  className,
  editable = true,
  fullItem = false,
  minimal = false,
  showBlanksAsChips = false,
  blankOutputFormat = 'token',
  immediatelyRender = false,
  ref: contentRef,
  value: initialContent = '',
  placeholder = 'Write something awesome...',
  ...other
}: EditorProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [rerenderKey, setRerenderKey] = useState(0);

  const lowlight = useMemo(() => createLowlight(common), []);

  const processedInitialContent = showBlanksAsChips
    ? toEditorHtml(initialContent)
    : initialContent;

  const debouncedOnChange = useMemo(
    () =>
      debounce((html: string) => {
        const output = showBlanksAsChips ? fromEditorHtml(html, blankOutputFormat) : html;
        onChange?.(output);
      }, 200),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, blankOutputFormat]
  );

  const editor = useEditor({
    editable,
    immediatelyRender,
    content: processedInitialContent,
    shouldRerenderOnTransaction: !!rerenderKey,
    onUpdate: (ctx) => {
      const html = ctx.editor.getHTML();
      debouncedOnChange(html);
    },
    extensions: [
      StarterKitExtension.configure({
        codeBlock: false,
        code: { HTMLAttributes: { class: editorClasses.content.codeInline } },
        heading: { HTMLAttributes: { class: editorClasses.content.heading } },
        horizontalRule: { HTMLAttributes: { class: editorClasses.content.hr } },
        listItem: { HTMLAttributes: { class: editorClasses.content.listItem } },
        blockquote: { HTMLAttributes: { class: editorClasses.content.blockquote } },
        bulletList: { HTMLAttributes: { class: editorClasses.content.bulletList } },
        orderedList: { HTMLAttributes: { class: editorClasses.content.orderedList } },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: editorClasses.content.link },
        },
      }),
      ...(minimal
        ? []
        : [TextAlignExtension.configure({ types: ['heading', 'paragraph'] })]),
      ...(minimal ? [] : [ImageExtension.configure({ HTMLAttributes: { class: editorClasses.content.image } })]),
      PlaceholderExtension.configure({
        placeholder,
        emptyEditorClass: editorClasses.content.placeholder,
      }),
      CodeBlockLowlightExtension.extend({
        addNodeView: () => ReactNodeViewRenderer(CodeHighlightBlock),
      }).configure({ lowlight }),
      // Custom extensions
      TextTransformExtension,
      ClearFormatExtension,
      ...(showBlanksAsChips ? [BlankNode] : []),
    ],
    ...other,
  });

  const globalBlanks = useContext(GlobalBlanksContext);
  const { nextNumber, currentQuestionOrder } = useQuestionNumbering();

  const handleInsertBlank = useCallback(() => {
    if (!editor) return;
    const json = editor.getJSON();
    const localUsed = new Set<number>();
    const walk = (node: Record<string, any>) => {
      if (node.type === 'blank') localUsed.add(node.attrs?.num ?? 0);
      (node.content || []).forEach(walk);
    };
    walk(json as Record<string, any>);
    // Gap-fill: combine local blanks + globally known blanks, find first unused
    const used = new Set<number>([...localUsed, ...globalBlanks]);
    let nextNum =
      localUsed.size === 0 && currentQuestionOrder
        ? currentQuestionOrder
        : Math.max(nextNumber, ...used, 0);
    while (used.has(nextNum)) nextNum += 1;
    editor.chain().focus().insertContent({ type: 'blank', attrs: { num: nextNum } }).run();
  }, [editor, globalBlanks, nextNumber, currentQuestionOrder]);

  const handleToggleFullscreen = useCallback(() => {
    editor?.unmount();
    setFullscreen((prev) => !prev);
    setRerenderKey((prev) => prev + 1);
  }, [editor]);

  const handleExitFullscreen = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        editor?.unmount();
        setFullscreen(false);
        setRerenderKey((prev) => prev + 1);
      }
    },
    [editor]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!editor?.isDestroyed && editor?.isEmpty && initialContent !== '<p></p>') {
        const content = showBlanksAsChips ? toEditorHtml(initialContent) : initialContent;
        editor?.commands.setContent(content);
      }
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, editor]);

  useEffect(() => {
    if (resetValue && !initialContent) {
      editor?.commands.clearContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  useEffect(() => {
    if (!fullscreen) return undefined;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleExitFullscreen);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleExitFullscreen);
    };
  }, [fullscreen, handleExitFullscreen]);

  return (
    <Portal disablePortal={!fullscreen}>
      {fullscreen && <Backdrop open sx={[(theme) => ({ zIndex: theme.zIndex.modal - 1 })]} />}

      <Box
        {...slotProps?.wrapper}
        sx={[
          { display: 'flex', flexDirection: 'column' },
          ...(Array.isArray(slotProps?.wrapper?.sx)
            ? slotProps.wrapper.sx
            : [slotProps?.wrapper?.sx]),
        ]}
      >
        <EditorRoot
          className={mergeClasses([editorClasses.root, className], {
            [editorClasses.state.error]: !!error,
            [editorClasses.state.disabled]: !editable,
            [editorClasses.state.fullscreen]: fullscreen,
          })}
          sx={sx}
        >
          {editor && !editor.isDestroyed && (
            <>
              <Toolbar
                editor={editor}
                fullItem={fullItem}
                fullscreen={fullscreen}
                minimal={minimal}
                onInsertBlank={showBlanksAsChips ? handleInsertBlank : undefined}
                onToggleFullscreen={handleToggleFullscreen}
              />
              <BubbleToolbar editor={editor} />
              <EditorContent
                ref={contentRef}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                editor={editor}
                className={editorClasses.content.root}
              />
            </>
          )}
        </EditorRoot>

        {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
      </Box>
    </Portal>
  );
}
