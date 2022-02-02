import { Box, Tooltip } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createEditor, Editor, Path, Range, Text, Transforms } from "slate";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { Leaf } from "../Leaf";
import styles from "./RichTextEditor.module.css";

const withTrackingLink = (editor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "tooltip" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "tooltip" ? true : isVoid(element);
  };

  return editor;
};

const RichTextEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);
  const [tracking_link] = useState("{{TRACKING_LINK}}");

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "tooltip":
        return <TooltipElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const insertTooltip = (editor) => {
    const tooltip = {
      type: "tooltip",
      children: [{ text: "{{TRACKING_LINK}}" }],
    };

    const p = {
      type: "paragraph",
      children: [{ text: "" }],
    };

    Transforms.insertNodes(editor, tooltip);
    Transforms.insertNodes(editor, p);
    Transforms.move(editor);
  };

  return (
    <Box className={styles.container}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);

          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: "word" });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^{(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.string(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              Transforms.select(editor, beforeRange);
              insertTooltip(editor);
              return;
            }
          }
        }}
      >
        <Editable renderElement={renderElement} className={styles.editor} />
      </Slate>
    </Box>
  );
};

const TooltipElement = (props) => {
  return (
    <Tooltip
      {...props.attributes}
      label="Hello World"
      placement="top-end"
      hasArrow
    >
      <span>{props.children}</span>
    </Tooltip>
  );
};

const DefaultElement = (props) => {
  return <span {...props.attributes}>{props.children}</span>;
};

export { RichTextEditor };
