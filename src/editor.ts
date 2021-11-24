// https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480
// https://developer.mozilla.org/en-US/docs/Web/API/Selection
import {RTSelection} from "./selection";
import {RTParagraph} from "./paragraph";

const alphanumeric = /^[\p{L}\p{N}]*$/u;

export class RichTextEditor
{
	readonly element: HTMLElement;
	selection: RTSelection;
	paragraphs: RTParagraph[];

	constructor(element: HTMLElement)
	{
		this.element = element;
		this.element.setAttribute('contenteditable', 'true');

		this.captureEdits();

		this.selection = new RTSelection(this);
		this.paragraphs = [ new RTParagraph(this) ];

		this.updateElement();
	}

	captureEdits()
	{
		this.element.addEventListener('keydown', (e) =>
		{
			console.log(e.key, e);
			switch (e.key)
			{
				case 'Escape':
				case 'Tab':
				case 'F1': case 'F2': case 'F3': case 'F4': case 'F5': case 'F6': case 'F7': case 'F8': case 'F9': case 'F10': case 'F11': case 'F12':
				case 'Shift':
				case 'Control':
				case 'Alt':
				case 'ArrowRight':case 'ArrowUp':case 'ArrowLeft':case 'ArrowDown':
				case 'Insert':
				case 'Home':
				case 'End':
				case 'PageUp':
				case 'PageDown':
					break;
				case 'Enter':
					this.insertParagraph();
					e.preventDefault();
					break;
				// removing
				case 'Delete':
					this.deleteInFront();
					e.preventDefault();
					break;
				case 'Backspace':
					this.deleteBack();
					e.preventDefault();
					break;
				default:
					if (e.key.length === 1 || e.code === 'Space')
					{
						this.insertText(e.key);
						e.preventDefault();
					}
					break;
			}
		});
	}

	insertText(text: string)
	{
		this.paragraphs[this.selection.anchor.parIndex].addText(text, this.selection.anchor.textOffset, this.selection.focus.textOffset);

		this.updateElement();
	}

	insertParagraph()
	{
		if (!this.selection.isCollapsed)
			this.paragraphs[this.selection.anchor.parIndex].removeText(this.selection.anchor.textOffset, this.selection.focus.textOffset);

		const [curtP, newP] = this.paragraphs[this.selection.anchor.parIndex].split(this.selection.anchor.textOffset);
		this.paragraphs[this.selection.anchor.parIndex] = curtP;
		const prevList = this.paragraphs;
		this.paragraphs = [...prevList.slice(0, this.selection.anchor.parIndex+1), newP, ...prevList.slice(this.selection.focus.parIndex+1)];
		this.selection.nextParagraph();

		this.updateElement();
	}

	removeParagraph(parIndex: number)
	{
		const prevList = this.paragraphs;
		this.paragraphs = [...prevList.slice(0, parIndex), ...prevList.slice(parIndex)];

		this.selection.prevParagraph();
	}

	deleteBack()
	{
		if (this.selection.isCollapsed)
		{
			if (this.selection.focus.textOffset === 0)
				this.removeParagraph(this.selection.focus.parIndex);
			else
				this.paragraphs[this.selection.anchor.parIndex].removeText(this.selection.focus.textOffset - 1, this.selection.focus.textOffset);
		}
		else
			this.paragraphs[this.selection.anchor.parIndex].removeText(this.selection.anchor.textOffset, this.selection.focus.textOffset);

		this.updateElement();
	}

	deleteInFront()
	{
		if (this.selection.isCollapsed)
			this.paragraphs[this.selection.anchor.parIndex].removeText(this.selection.focus.textOffset, this.selection.focus.textOffset+1);
		else
			this.paragraphs[this.selection.anchor.parIndex].removeText(this.selection.anchor.textOffset, this.selection.focus.textOffset);

		this.updateElement();
	}

	updateElement()
	{
		const html = this.paragraphs.map(p => p.html());
		this.element.innerHTML = html.join('');

		this.selection.update();
	}

	paragraphIndex(node: HTMLElement) : number | null
	{
		let found: HTMLElement | null = null;
		while (node !== this.element)
		{
			if (node?.classList?.contains('rt-paragraph'))
			{
				found = node;
				break;
			}
			node = node.parentElement as HTMLElement;
		}
		return found ? this.paragraphs.findIndex(p => p.id === found?.id) : null;
	}
}