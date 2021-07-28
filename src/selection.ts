import {RichTextEditor} from "./editor";

export class RTSelection
{
	private editor: RichTextEditor;
	private readonly docSelection: Selection | undefined;
	anchor: RTSelectionPoint;
	focus: RTSelectionPoint;
	isCollapsed: boolean;

	constructor(editor: RichTextEditor)
	{
		this.editor = editor;

		this.anchor = new RTSelectionPoint(0, 0);
		this.focus = new RTSelectionPoint(0, 0);
		this.isCollapsed = true;
		let selection = document.getSelection();
		if (!selection)
		{
			console.error('cannot get document selection!');
			return;
		}
		this.docSelection = selection;

		document.addEventListener('selectionchange', () =>
		{
			// @ts-ignore
			const {anchorNode,anchorOffset,focusNode,focusOffset,isCollapsed} = this.docSelection;
			if (this.editor.element.contains(anchorNode))
			{
				this.anchor = new RTSelectionPoint(this.editor.paragraphIndex(anchorNode as HTMLElement), anchorOffset);
				this.focus = new RTSelectionPoint(this.editor.paragraphIndex(focusNode as HTMLElement), focusOffset);
				this.isCollapsed = isCollapsed;
			}
		});
	}

	moveOffset(movement: number)
	{
		this.anchor.textOffset = Math.max(0, this.anchor.textOffset + movement);
		this.focus.textOffset = Math.max(0, this.focus.textOffset + movement);
	}

	nextParagraph()
	{
		const nextParIndex = this.anchor.parIndex+1;
		this.anchor = new RTSelectionPoint(nextParIndex, 0);
		this.focus = new RTSelectionPoint(nextParIndex, 0);
		this.isCollapsed = true;
	}

	prevParagraph()
	{
		const prevParIndex = this.anchor.parIndex-1;
		const offsetEnd = this.editor.paragraphs[prevParIndex].text.length || 0;
		this.anchor = new RTSelectionPoint(prevParIndex, offsetEnd);
		this.focus = new RTSelectionPoint(prevParIndex, offsetEnd);
		this.isCollapsed = true;
	}

	update()
	{
		const anchorNode = this.getParagraphTextNode(this.anchor);
		const focusNode = this.getParagraphTextNode(this.focus);

		const range = document.createRange();
		range.setStart(anchorNode, this.anchor.textOffset);
		range.setEnd(focusNode, this.focus.textOffset);
		if (this.docSelection)
		{
			this.docSelection.removeAllRanges();
			this.docSelection.addRange(range);
		}
	}

	getParagraphTextNode({parIndex, textOffset}: RTSelectionPoint): HTMLElement
	{
		return this.editor.paragraphs[parIndex].getNode(textOffset) as HTMLElement;
	}
}

class RTSelectionPoint
{
	parIndex: number;
	textOffset: number;

	constructor(parIndex: number | null, textOffset: number)
	{
		this.parIndex = parIndex || 0;
		this.textOffset = textOffset;
	}
}