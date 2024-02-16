/*
 * (c) Copyright Ascensio System SIA 2010-2023
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function (window, undefined) {
	var InitClass = AscFormat.InitClass;
	var CAnimTexture = AscFormat.CAnimTexture;

	const STATE_FLAG_SELECTED = 1;
	const STATE_FLAG_HOVERED = 2;
	const STATE_FLAG_PRESSED = 4;
	const STATE_FLAG_DISABLED = 8;

	const CONTROL_TYPE_UNKNOWN = 0;
	const CONTROL_TYPE_LABEL = 1;
	const CONTROL_TYPE_IMAGE = 2;
	const CONTROL_TYPE_BUTTON = 3;
	const CONTROL_TYPE_HEADER = 4;
	const CONTROL_TYPE_SCROLL_VERT = 5;
	const CONTROL_TYPE_SCROLL_HOR = 6;
	const CONTROL_TYPE_TIMELINE_CONTAINER = 7;
	const CONTROL_TYPE_TIMELINE = 8;
	const CONTROL_TYPE_SEQ_LIST_CONTAINER = 9;
	const CONTROL_TYPE_SEQ_LIST = 10;
	const CONTROL_TYPE_ANIM_SEQ = 11;
	const CONTROL_TYPE_ANIM_GROUP_LIST = 12;
	const CONTROL_TYPE_ANIM_GROUP = 13;
	const CONTROL_TYPE_ANIM_ITEM = 14;
	const CONTROL_TYPE_EFFECT_BAR = 15;


	function CControl(oParentControl) {
		AscFormat.ExecuteNoHistory(function () {
			AscFormat.CShape.call(this);
			this.setRecalculateInfo();
			this.setBDeleted(false);
			this.setLayout(0, 0, 0, 0);
		}, this, []);

		this.parent = editor.WordControl.m_oLogicDocument.Slides[0];
		this.parentControl = oParentControl;
		this.state = 0;
		this.hidden = false;
		this.previous = null;
		this.next = null;
	}

	InitClass(CControl, AscFormat.CShape, CONTROL_TYPE_UNKNOWN);

	CControl.prototype.DEFALT_WRAP_OBJECT = {
		oTxWarpStruct: null,
		oTxWarpStructParamarks: null,
		oTxWarpStructNoTransform: null,
		oTxWarpStructParamarksNoTransform: null
	};
	CControl.prototype.setHidden = function (bVal) {
		if (this.hidden !== bVal) {
			this.hidden = bVal;
			this.onUpdate();
		}
	};
	CControl.prototype.show = function () {
		this.setHidden(false);
	};
	CControl.prototype.hide = function () {
		this.setHidden(true);
	};
	CControl.prototype.isHidden = function () {
		return this.hidden;
	};
	CControl.prototype.notAllowedWithoutId = function () {
		return false;
	};
	//define shape methods
	CControl.prototype.getBodyPr = function () {
		return this.bodyPr;
	};
	CControl.prototype.getScrollOffsetX = function (oChild) {
		return 0;
	};
	CControl.prototype.getScrollOffsetY = function (oChild) {
		return 0;
	};
	CControl.prototype.getParentScrollOffsetX = function (oChild) {
		if (this.parentControl) {
			return this.parentControl.getScrollOffsetX(oChild);
		}
		return 0;
	};
	CControl.prototype.getParentScrollOffsetY = function (oChild) {
		if (this.parentControl) {
			return this.parentControl.getScrollOffsetY(oChild);
		}
		return 0;
	};
	CControl.prototype.getFullTransformMatrix = function () {
		return this.transform;
	};
	CControl.prototype.getInvFullTransformMatrix = function () {
		return this.invertTransform;
	};
	CControl.prototype.multiplyParentTransforms = function (oLocalTransform) {
		var oMT = AscCommon.global_MatrixTransformer;
		var oTransform = oMT.CreateDublicateM(oLocalTransform);
		var oScrollMatrix = new AscCommon.CMatrix();
		oScrollMatrix.tx = this.getParentScrollOffsetX(this);
		oScrollMatrix.ty = this.getParentScrollOffsetY(this);
		oMT.MultiplyAppend(oTransform, oScrollMatrix);
		var oParentTransform = this.parentControl && this.parentControl.getFullTransformMatrix();
		oParentTransform && oMT.MultiplyAppend(oTransform, oParentTransform);
		return oTransform;
	};
	CControl.prototype.getFullTransform = function () {
		return this.transform;
	};
	CControl.prototype.getFullTextTransform = function () {
		return this.transformText;
	};
	CControl.prototype.recalculate = function () {
		AscFormat.CShape.prototype.recalculate.call(this);
	};
	CControl.prototype.recalculateBrush = function () {
		this.brush = null;
	};
	CControl.prototype.recalculatePen = function () {
		this.pen = null;
	};
	CControl.prototype.recalculateContent = function () {
	};
	CControl.prototype.recalculateGeometry = function () {
		//this.calcGeometry = AscFormat.CreateGeometry("rect");
		//this.calcGeometry.Recalculate(this.extX, this.extY);
	};
	CControl.prototype.recalculateTransform = function () {
		if (!this.transform) {
			this.transform = new AscCommon.CMatrix();
		}
		var tx = this.getLeft();
		var ty = this.getTop();
		this.x = tx;
		this.y = ty;
		this.rot = 0;
		this.extX = this.getWidth();
		this.extY = this.getHeight();
		this.flipH = false;
		this.flipV = false;
		ty += this.getParentScrollOffsetY(this);
		var oCurParent = this.parentControl;

		if (oCurParent) {
			tx += oCurParent.transform.tx;
			ty += oCurParent.transform.ty
		}
		this.transform.tx = tx;
		this.transform.ty = ty;
		if (!this.invertTransform) {
			this.invertTransform = new AscCommon.CMatrix();
		}
		this.invertTransform.tx = -tx;
		this.invertTransform.ty = -ty;
		this.localTransform = this.transform;
	};
	CControl.prototype.recalculateTransformText = function () {
		if (!this.transformText) {
			this.transformText = new AscCommon.CMatrix();
		}
		this.transformText.tx = this.transform.tx;
		this.transformText.ty = this.transform.ty;

		if (!this.invertTransformText) {
			this.invertTransformText = new AscCommon.CMatrix();
		}
		this.invertTransformText.tx = -this.transform.tx;
		this.invertTransformText.ty = -this.transform.ty;
		this.localTransformText = this.transformText;
	};
	CControl.prototype.recalculateBounds = function () {
		var dX = this.transform.tx;
		var dY = this.transform.ty;
		this.bounds.reset(dX, dY, dX + this.getWidth(), dY + this.getHeight())
	};
	CControl.prototype.recalculateSnapArrays = function () {
	};
	CControl.prototype.checkAutofit = function (bIgnoreWordShape) {
		return false;
	};
	CControl.prototype.checkTextWarp = function (oContent, oBodyPr, dWidth, dHeight, bNeedNoTransform, bNeedWarp) {
		return this.DEFALT_WRAP_OBJECT;
	};
	CControl.prototype.addToRecalculate = function () {
	};
	CControl.prototype.canHandleEvents = function () {
		return true;
	};
	CControl.prototype.getPenWidth = function (graphics) {
		var fScale = graphics.m_oCoordTransform.sx;
		var nPenW = AscCommon.AscBrowser.convertToRetinaValue(1, true) / fScale;
		return nPenW;
	};
	CControl.prototype.draw = function (graphics) {
		if (this.isHidden()) {
			return false;
		}
		if (!this.checkUpdateRect(graphics.updatedRect)) {
			return false;
		}

		this.recalculateTransform();
		this.recalculateTransformText();

		var sFillColor = this.getFillColor();
		var sOutlineColor = this.getOutlineColor();
		var oColor;
		if (sOutlineColor || sFillColor) {
			graphics.SaveGrState();
			graphics.transform3(this.transform);
			var x = 0;
			var y = 0;
			var extX = this.getWidth();
			var extY = this.getHeight();
			if (sFillColor) {
				oColor = AscCommon.RgbaHexToRGBA(sFillColor);
				graphics.b_color1(oColor.R, oColor.G, oColor.B, 0xFF);
				graphics.rect(x, y, extX, extY);
				graphics.df();
			}
			if (sOutlineColor) {
				oColor = AscCommon.RgbaHexToRGBA(sOutlineColor);
				graphics.SetIntegerGrid(true);

				var nPenW = this.getPenWidth(graphics);
				//graphics.p_width(100);//AscCommon.AscBrowser.convertToRetinaValue(1, true);
				graphics.p_color(oColor.R, oColor.G, oColor.B, 0xFF);
				graphics.drawHorLine(0, y, x, x + extX, nPenW);
				graphics.drawHorLine(0, y + extY, x, x + extX, nPenW);
				graphics.drawVerLine(2, x, y, y + extY, nPenW);
				graphics.drawVerLine(2, x + extX, y, y + extY, nPenW);
				graphics.ds();
			}
			graphics.RestoreGrState();
		}
		AscFormat.CShape.prototype.draw.call(this, graphics);
		return true;

	};
	CControl.prototype.hit = function (x, y) {
		if (this.parentControl && !this.parentControl.hit(x, y)) {
			return false;
		}
		var oInv = this.invertTransform;
		var tx = oInv.TransformPointX(x, y);
		var ty = oInv.TransformPointY(x, y);
		return tx >= 0 && tx <= this.extX && ty >= 0 && ty <= this.extY;
	};
	CControl.prototype.setStateFlag = function (nFlag, bValue) {
		var nOldState = this.state;
		if (bValue) {
			this.state |= nFlag;
		} else {
			this.state &= (~nFlag);
		}
		if (nOldState !== this.state) {
			this.onUpdate();
		}
	};
	CControl.prototype.getStateFlag = function (nFlag) {
		return (this.state & nFlag) !== 0;
	};
	CControl.prototype.isHovered = function () {
		return this.getStateFlag(STATE_FLAG_HOVERED);
	};
	CControl.prototype.isActive = function () {
		if (this.parentControl) {
			if (!this.eventListener && this.parentControl.isEventListener(this)) {
				return true;
			}
		}
		return false;
	};
	CControl.prototype.setHoverState = function () {
		this.setStateFlag(STATE_FLAG_HOVERED, true);
	};
	CControl.prototype.setNotHoverState = function () {
		this.setStateFlag(STATE_FLAG_HOVERED, false);
	};
	CControl.prototype.onMouseMove = function (e, x, y) {
		if (e.IsLocked) {
			return false;
		}
		if (!this.canHandleEvents()) {
			return false;
		}
		var bHover = this.hit(x, y);
		var bRet = bHover !== this.isHovered();
		if (bHover) {
			this.setHoverState();
		} else {
			this.setNotHoverState();
		}
		return bRet;
	};
	CControl.prototype.onMouseDown = function (e, x, y) {
		if (!this.canHandleEvents()) {
			return false;
		}
		if (this.hit(x, y)) {
			if (this.parentControl) {
				this.parentControl.setEventListener(this);
			}
			return true;
		}
		return false;
	};
	CControl.prototype.onMouseUp = function (e, x, y) {
		if (this.parentControl) {
			if (this.parentControl.isEventListener(this)) {
				this.parentControl.setEventListener(null);
				return true;
			}
		}
		return false;
	};
	CControl.prototype.onMouseWheel = function (e, deltaY, X, Y) {
		return false;
	};
	CControl.prototype.onUpdate = function () {
		if (this.parentControl) {
			var oBounds = this.getBounds();
			this.parentControl.onChildUpdate(oBounds);
		}
	};
	CControl.prototype.onChildUpdate = function (oBounds) {
		if (this.parentControl) {
			this.parentControl.onChildUpdate(oBounds);
		}
	};
	CControl.prototype.getCursorInfo = function (e, x, y) {
		if (!this.hit(x, y)) {
			return null;
		} else {
			return {
				cursorType: "default",
				tooltip: this.getTooltipText()
			}
		}
	};
	CControl.prototype.checkUpdateRect = function (oUpdateRect) {
		var oBounds = this.getBounds();
		if (oUpdateRect && oBounds) {
			if (!oUpdateRect.isIntersectOther(oBounds)) {
				return false;
			}
		}
		return true;
	};
	CControl.prototype.recalculate = function () {
		AscFormat.CShape.prototype.recalculate.call(this);
	};
	/**
	 * Sets the location and dimensions of the control inside the parent container.
	 *
	 * @param {number} dX - Offset of the element along the X axis relative to the upper-left corner of the parent container.
	 * @param {number} dY - Offset of the element along the Y axis relative to the upper-left corner of the parent container.
	 * @param {number} dExtX - Width of the element.
	 * @param {number} dExtY - Height of the element.
	 *
	 * @note
	 * - Negative values for dX and dY are supported with behavior similar to "overflow: hidden" in CSS.
	 * - Negative values for dExtX and dExtY are not supported and may lead to unexpected behavior.
	 * - It is recommended to avoid using negative values for dExtX and dExtY to ensure proper rendering and hit detection.
	 */
	CControl.prototype.setLayout = function (dX, dY, dExtX, dExtY) {
		if (!this.spPr) {
			this.spPr = new AscFormat.CSpPr();
		}
		if (!this.spPr.xfrm) {
			this.spPr.xfrm = new AscFormat.CXfrm();
		}

		this.spPr.xfrm.offX = dX;
		this.spPr.xfrm.offY = dY;
		this.spPr.xfrm.extX = dExtX;
		this.spPr.xfrm.extY = dExtY;
		this.handleUpdateExtents();
	};
	CControl.prototype.getLeft = function () {
		return this.spPr.xfrm.offX;
	};
	CControl.prototype.getTop = function () {
		return this.spPr.xfrm.offY;
	};
	CControl.prototype.getRight = function () {
		return this.spPr.xfrm.offX + this.spPr.xfrm.extX;
	};
	CControl.prototype.getBottom = function () {
		return this.spPr.xfrm.offY + this.spPr.xfrm.extY;
	};
	CControl.prototype.getWidth = function () {
		return this.spPr.xfrm.extX;
	};
	CControl.prototype.getHeight = function () {
		return this.spPr.xfrm.extY;
	};
	CControl.prototype.getBounds = function () {
		this.recalculateBounds();
		this.recalculateTransform();
		this.recalculateTransformText();
		return this.bounds;
	};
	CControl.prototype.convertRelToAbs = function (oPos) {
		var oAbsPos = { x: oPos.x, y: oPos.y };
		var oParent = this;
		while (oParent) {
			oAbsPos.x += oParent.getLeft();
			oAbsPos.y += oParent.getTop();
			oParent = oParent.parentControl;
		}
		return oAbsPos;
	};
	CControl.prototype.convertAbsToRel = function (oPos) {
		var oRelPos = { x: oPos.x, y: oPos.y };
		var oParent = this;
		while (oParent) {
			oRelPos.x -= oParent.getLeft();
			oRelPos.y -= oParent.getTop();
			oParent = oParent.parentControl;
		}
		return oRelPos;
	};
	CControl.prototype.getNext = function () {
		return this.next;
	};
	CControl.prototype.getPrevious = function () {
		return this.previous;
	};
	CControl.prototype.setNext = function (v) {
		this.next = v;
	};
	CControl.prototype.setPrevious = function (v) {
		this.previous = v;
	};
	CControl.prototype.setParentControl = function (v) {
		this.parentControl = v;
	};
	CControl.prototype.getTiming = function () {
		var oSlide = this.getSlide();
		if (oSlide) {
			return oSlide.timing;
		}
		return null;
	};
	CControl.prototype.getSlide = function () {
		var oSlide = null;
		if (editor.WordControl && editor.WordControl.m_oLogicDocument) {
			oSlide = editor.WordControl.m_oLogicDocument.GetCurrentSlide();
			return oSlide;
		}
		return null;
	};
	CControl.prototype.getSlideNum = function () {
		var oSlide = this.getSlide();
		if (oSlide) {
			return oSlide.num;
		}
		return -1;
	};
	CControl.prototype.getFillColor = function () {
		var sFillColor;
		var oSkin = AscCommon.GlobalSkin;
		if (this.isActive()) {
			sFillColor = oSkin.ThumbnailsPageOutlineActive;
		} else if (this.isHovered()) {
			sFillColor = oSkin.ScrollerHoverColor;
		} else {
			sFillColor = oSkin.BackgroundColorThumbnails;
		}
		return sFillColor;
	};
	CControl.prototype.getOutlineColor = function () {
		var sOutlineColor;
		var oSkin = AscCommon.GlobalSkin;
		if (this.isActive()) {
			sOutlineColor = oSkin.ScrollOutlineActiveColor;
		} else if (this.isHovered()) {
			sOutlineColor = oSkin.ThumbnailsPageOutlineHover;
		} else {
			sOutlineColor = oSkin.ScrollOutlineColor;
		}
		return sOutlineColor;
	};
	CControl.prototype.drawShdw = function () {

	};


	function CControlContainer(oParentControl) {
		CControl.call(this, oParentControl);
		this.children = [];
		this.recalcInfo.recalculateChildrenLayout = true;
		this.recalcInfo.recalculateChildren = true;

		this.eventListener = null;
	}

	InitClass(CControlContainer, CControl, CONTROL_TYPE_UNKNOWN);

	CControlContainer.prototype.isEventListener = function (oChild) {
		return this.eventListener === oChild;
	};
	CControlContainer.prototype.onScroll = function () {
	};
	CControlContainer.prototype.onStartScroll = function () {
	};
	CControlContainer.prototype.onEndScroll = function () {
	};
	CControlContainer.prototype.clear = function () {
		for (var nIdx = this.children.length - 1; nIdx > -1; --nIdx) {
			this.removeControl(this.children[nIdx]);
		}
	};
	CControlContainer.prototype.addControl = function (oChild) {
		var oLast = this.children[this.children.length - 1];
		this.children.push(oChild);
		if (oLast) {
			oLast.setNext(oChild);
			oChild.setPrevious(oLast);
			oChild.setParentControl(this);
		}
		return oChild;
	};
	CControlContainer.prototype.removeControl = function (oChild) {
		var nIdx = this.getChildIdx(oChild);
		this.removeByIdx(nIdx);
	};
	CControlContainer.prototype.removeByIdx = function (nIdx) {
		if (nIdx > -1 && nIdx < this.children.length) {
			var oChild = this.children[nIdx];
			oChild.setNext(null);
			oChild.setPrevious(null);
			oChild.setParentControl(null);
			var oPrev = this.children[nIdx - 1] || null;
			var oNext = this.children[nIdx + 1] || null;
			if (oPrev) {
				oPrev.setNext(oNext);
			}
			if (oNext) {
				oNext.setPrevious(oPrev);
			}
			this.children.splice(nIdx, 1);
		}
	};
	CControlContainer.prototype.getChildIdx = function (oChild) {
		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			if (this.children[nChild] === oChild) {
				return nChild;
			}
		}
		return -1;
	};
	CControlContainer.prototype.getChildByType = function (nType) {
		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			var oChild = this.children[nChild];
			if (oChild.getObjectType() === nType) {
				return oChild;
			}
		}
		return null;
	};
	CControlContainer.prototype.getChild = function (nIdx) {
		if (nIdx > -1 && nIdx < this.children.length) {
			return this.children[nIdx];
		}
	};
	CControlContainer.prototype.draw = function (graphics) {
		if (!CControl.prototype.draw.call(this, graphics)) {
			return false;
		}
		this.clipStart(graphics);
		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			this.children[nChild].draw(graphics);
		}
		this.clipEnd(graphics);
		return true;
	};
	CControlContainer.prototype.clipStart = function (graphics) {
	};
	CControlContainer.prototype.clipEnd = function (graphics) {
	};
	CControlContainer.prototype.recalculateChildrenLayout = function () {
	};
	CControlContainer.prototype.recalculateChildren = function () {
	};
	CControlContainer.prototype.recalculate = function () {
		AscFormat.ExecuteNoHistory(function () {
			CControl.prototype.recalculate.call(this);
			if (this.recalcInfo.recalculateChildren) {
				this.recalculateChildren();
				this.recalcInfo.recalculateChildren = false;
			}
			if (this.recalcInfo.recalculateChildrenLayout) {
				this.recalculateChildrenLayout();
				this.recalcInfo.recalculateChildrenLayout = false;
			}
			for (var nChild = 0; nChild < this.children.length; ++nChild) {
				this.children[nChild].recalculate();
			}
		}, this, []);
	};
	CControlContainer.prototype.setLayout = function (dX, dY, dExtX, dExtY) {
		AscFormat.ExecuteNoHistory(function () {
			CControl.prototype.setLayout.call(this, dX, dY, dExtX, dExtY);
			this.recalcInfo.recalculateChildrenLayout = true;
		}, this, []);
	};
	CControlContainer.prototype.handleUpdateExtents = function () {
		this.recalcInfo.recalculateChildrenLayout = true;
		CControl.prototype.handleUpdateExtents.call(this);
	};
	CControlContainer.prototype.setEventListener = function (oChild) {
		if (oChild) {
			this.eventListener = oChild;
			if (this.parentControl) {
				this.parentControl.setEventListener(this);
			}
		} else {
			this.eventListener = null;
			if (this.parentControl) {
				this.parentControl.setEventListener(null);
			}
		}
	};
	CControlContainer.prototype.onMouseDown = function (e, x, y) {
		for (var nChild = this.children.length - 1; nChild >= 0; --nChild) {
			if (this.children[nChild].onMouseDown(e, x, y)) {
				return true;
			}
		}
		return CControl.prototype.onMouseDown.call(this, e, x, y);
	};
	CControlContainer.prototype.onMouseMove = function (e, x, y) {
		for (var nChild = this.children.length - 1; nChild >= 0; --nChild) {
			if (this.children[nChild].onMouseMove(e, x, y)) {
				return true;
			}
		}
		return CControl.prototype.onMouseMove.call(this, e, x, y);
	};
	CControlContainer.prototype.onMouseUp = function (e, x, y) {
		for (var nChild = this.children.length - 1; nChild >= 0; --nChild) {
			if (this.children[nChild].onMouseUp(e, x, y)) {
				return true;
			}
		}
		return CControl.prototype.onMouseUp.call(this, e, x, y);
	};
	CControlContainer.prototype.onMouseWheel = function (e, deltaY, X, Y) {
		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			if (this.children[nChild].onMouseWheel(e, deltaY, X, Y)) {
				return true;
			}
		}
		return CControl.prototype.onMouseWheel.call(this, e, deltaY, X, Y);
	};
	CControlContainer.prototype.isScrolling = function () {
		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			var oChild = this.children[nChild];
			if (oChild.isOnScroll && oChild.isOnScroll()) {
				return true;
			}
		}
		return false;
	};
	CControlContainer.prototype.canHandleEvents = function () {
		return false;
	};
	CControlContainer.prototype.onResize = function () {
		this.handleUpdateExtents();
		this.recalculate();
	};


	function CTopControl(oDrawer) {
		CControlContainer.call(this, null);
		this.drawer = oDrawer;
	}

	InitClass(CTopControl, CControlContainer, CONTROL_TYPE_UNKNOWN);

	CTopControl.prototype.onUpdateRect = function (oBounds) {
		if (this.drawer) {
			this.drawer.OnAnimPaneChanged(oBounds);
		}
	};
	CTopControl.prototype.onUpdate = function () {
		var oBounds = this.getBounds();
		this.onUpdateRect(oBounds);
	};
	CTopControl.prototype.onChildUpdate = function (oBounds) {
		this.onUpdateRect(oBounds);
	};
	CTopControl.prototype.onResize = function () {
		this.setLayout(0, 0, this.drawer.GetWidth(), this.drawer.GetHeight());
		CControlContainer.prototype.onResize.call(this);
		this.onUpdate();
	};


	function CLabel(oParentControl, sString, nFontSize, bBold, nParaAlign) {
		CControl.call(this, oParentControl);
		AscFormat.ExecuteNoHistory(function () {
			this.string = sString;
			this.fontSize = nFontSize;
			this.createTextBody();
			var oTxLstStyle = new AscFormat.TextListStyle();
			oTxLstStyle.levels[0] = new CParaPr();
			oTxLstStyle.levels[0].DefaultRunPr = new AscCommonWord.CTextPr();
			oTxLstStyle.levels[0].DefaultRunPr.FontSize = nFontSize;
			oTxLstStyle.levels[0].DefaultRunPr.Bold = bBold;
			oTxLstStyle.levels[0].DefaultRunPr.Color = new AscCommonWord.CDocumentColor(0x44, 0x44, 0x44, false);
			oTxLstStyle.levels[0].DefaultRunPr.RFonts.SetAll("Arial", -1);
			if (AscFormat.isRealNumber(nParaAlign)) {
				oTxLstStyle.levels[0].Jc = nParaAlign;
			}
			this.txBody.setLstStyle(oTxLstStyle);
			this.bodyPr = new AscFormat.CBodyPr();
			this.bodyPr.setDefault();
			this.bodyPr.anchor = 1;//vertical align ctr
			this.bodyPr.resetInsets();
			this.bodyPr.horzOverflow = AscFormat.nHOTClip;
			this.bodyPr.vertOverflow = AscFormat.nVOTClip;
		}, this, []);
	}

	InitClass(CLabel, CControl, CONTROL_TYPE_LABEL);

	CLabel.prototype.getString = function () {
		return AscCommon.translateManager.getValue(this.string);
	};
	CLabel.prototype.recalculateContent = function () {
		//this.recalculateGeometry();
		this.recalculateTransform();
		//        this.txBody.content.Recalc_AllParagraphs_CompiledPr();
		if (!this.txBody.bFit || !AscFormat.isRealNumber(this.txBody.fitWidth) || this.txBody.fitWidth > this.getWidth()) {
			this.txBody.recalculateOneString(this.getString());
		}
	};
	CLabel.prototype.canHandleEvents = function () {
		return false;
	};
	CLabel.prototype.getFillColor = function () {
		return null;
	};
	CLabel.prototype.getOutlineColor = function () {
		return null;
	};
	CLabel.prototype.recalculateTransformText = function () {
		var Y = this.getHeight() / 2 - this.txBody.content.GetSummaryHeight() / 2;
		if (!this.transformText) {
			this.transformText = new AscCommon.CMatrix();
		}
		this.transformText.tx = this.transform.tx;
		this.transformText.ty = this.transform.ty + Y;

		if (!this.invertTransformText) {
			this.invertTransformText = new AscCommon.CMatrix();
		}
		this.invertTransformText.tx = -this.transformText.tx;
		this.invertTransformText.ty = -this.transformText.ty;
		this.localTransformText = this.transformText;
	};
	CLabel.prototype.recalculateTransformText2 = function () {
		return null;
	};


	function CImageControl(oParentControl) {
		CControl.call(this, oParentControl)
	}

	InitClass(CImageControl, CControl, CONTROL_TYPE_IMAGE);

	CImageControl.prototype.canHandleEvents = function () {
		return false;
	};
	//CImageControl.prototype.draw = function() {
	//};


	function CButton(oParentControl, fOnMouseDown, fOnMouseMove, fOnMouseUp) {
		CControlContainer.call(this, oParentControl);
		this.onMouseDownCallback = fOnMouseDown;
		this.onMouseMoveCallback = fOnMouseMove;
		this.onMouseUpCallback = fOnMouseUp;
	}

	InitClass(CButton, CControlContainer, CONTROL_TYPE_BUTTON);

	CButton.prototype.onMouseDown = function (e, x, y) {
		if (this.onMouseDownCallback && this.onMouseDownCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseDown.call(this, e, x, y);
	};
	CButton.prototype.onMouseMove = function (e, x, y) {
		if (this.onMouseMoveCallback && this.onMouseMoveCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseMove.call(this, e, x, y);
	};
	CButton.prototype.onMouseUp = function (e, x, y) {
		if (this.onMouseUpCallback && this.onMouseUpCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseUp.call(this, e, x, y);
	};
	CButton.prototype.canHandleEvents = function () {
		return true;
	};
	// CButton.prototype.draw = function(graphics) {
	//     if(this.isHidden()){
	//         return false;
	//     }
	//     if(!this.checkUpdateRect(graphics.updatedRect)) {
	//         return false;
	//     }
	//
	//     graphics.SaveGrState();
	//     var oSkin = AscCommon.GlobalSkin;
	//     //ScrollBackgroundColor     : "#EEEEEE",
	//     //ScrollOutlineColor        : "#CBCBCB",
	//     //ScrollOutlineHoverColor   : "#CBCBCB",
	//     //ScrollOutlineActiveColor  : "#ADADAD",
	//     //ScrollerColor             : "#F7F7F7",
	//     //ScrollerHoverColor        : "#C0C0C0",
	//     //ScrollerActiveColor       : "#ADADAD",
	//     //ScrollArrowColor          : "#ADADAD",
	//     //ScrollArrowHoverColor     : "#F7F7F7",
	//     //ScrollArrowActiveColor    : "#F7F7F7",
	//     //ScrollerTargetColor       : "#CFCFCF",
	//     //ScrollerTargetHoverColor  : "#F1F1F1",
	//     //ScrollerTargetActiveColor : "#F1F1F1",
	//     var x = 0;
	//     var y = 0;
	//     var extX = this.getWidth();
	//     var extY = this.getHeight();
	//     graphics.transform3(this.transform);
	//
	//     var sFillColor;
	//     var sOutlineColor;
	//     var oColor;
	//     if(this.isActive()) {
	//         sFillColor = oSkin.ScrollerActiveColor;
	//         sOutlineColor = oSkin.ScrollOutlineActiveColor;
	//     }
	//     else if(this.isHovered()) {
	//         sFillColor = oSkin.ScrollerHoverColor;
	//         sOutlineColor = oSkin.ScrollOutlineHoverColor;
	//     }
	//     else {
	//         sFillColor = oSkin.ScrollerColor;
	//         sOutlineColor = oSkin.ScrollOutlineColor;
	//     }
	//     oColor = AscCommon.RgbaHexToRGBA(sFillColor);
	//     graphics.b_color1(oColor.R, oColor.G, oColor.B, 0xFF);
	//     graphics.rect(x, y, extX, extY);
	//     graphics.df();
	//     oColor = AscCommon.RgbaHexToRGBA(sOutlineColor);
	//
	//     graphics.SetIntegerGrid(true);
	//     graphics.p_width(0);
	//     graphics.p_color(oColor.R, oColor.G, oColor.B, 0xFF);
	//     graphics.drawHorLine(0, y, x, x + extX, 0);
	//     graphics.drawHorLine(0, y + extY, x, x + extX, 0);
	//     graphics.drawVerLine(2, x, y, y + extY, 0);
	//     graphics.drawVerLine(2, x + extX, y, y + extY, 0);
	//     graphics.ds();
	//     graphics.RestoreGrState();
	//     return true;
	// };

	CButton.prototype.getFillColor = function () {
		// if(this.parentControl instanceof CTimelineContainer) {
		//     return null;
		// }

		var oSkin = AscCommon.GlobalSkin;
		if (this.isActive()) {
			return oSkin.ScrollerActiveColor;
		} else if (this.isHovered()) {
			return oSkin.ScrollerHoverColor;
		} else if (this.isDisabled()) {
			return '#123456'
		} else {
			return oSkin.ScrollerColor;
		}
	};
	CButton.prototype.getOutlineColor = function () {
		if (this.parentControl instanceof CTimeline) { return '#000' }

		var oSkin = AscCommon.GlobalSkin;
		if (this.isActive()) {
			return oSkin.ScrollOutlineActiveColor;
		} else if (this.isHovered()) {
			return oSkin.ScrollOutlineHoverColor;
		} else {
			return oSkin.ScrollOutlineColor;
		}
	};
	CButton.prototype.isPressed = function () {
		return this.getStateFlag(STATE_FLAG_PRESSED);
	};
	CButton.prototype.disable = function () {
		return this.setStateFlag(STATE_FLAG_DISABLED, true)
	};
	CButton.prototype.enable = function () {
		return this.setStateFlag(STATE_FLAG_DISABLED, false)
	};
	CButton.prototype.isDisabled = function () {
		return this.getStateFlag(STATE_FLAG_DISABLED);
	};


	function CAnimPaneHeader(oDrawer) {
		CTopControl.call(this, oDrawer);
		this.label = this.addControl(new CLabel(this, "Animation Pane", 10, true));

		this.playButton = this.addControl(new CButton(
			this, null, null, managePreview));
		this.moveUpButton = this.addControl(new CButton(
			this, null, null, moveChosenUp));
		this.moveDownButton = this.addControl(new CButton(
			this, null, null, moveChosenDown));
		this.closeButton = this.addControl(new CButton(
			this, null, null, closePanel));

		// Event handlers for button of CAnimPaneHeader ---

		function managePreview(event, x, y) {
			if (!this.hit(x, y)) { return }
			if (this.isDisabled()) { return }
			if(Asc.editor.asc_IsStartedAnimationPreview()) {
				Asc.editor.asc_StopAnimationPreview();
			}
			else {
				let aSelectedEffects = this.getTiming().getSelectedEffects();
				if(aSelectedEffects.length > 1) {
					Asc.editor.asc_StartAnimationPreview(false);
				}
				else {
					Asc.editor.asc_StartAnimationPreview(true);
				}
			}
		}

		function moveChosenUp(event, x, y) {
			if (!this.hit(x, y)) { return }
			if (this.isDisabled()) { return }
			if (Asc.editor.asc_canMoveAnimationEarlier()) {
				if (Asc.editor.asc_IsStartedAnimationPreview()) {
					Asc.editor.asc_StopAnimationPreview()
				}
				Asc.editor.asc_moveAnimationEarlier()
			}
		}

		function moveChosenDown(event, x, y) {
			if (!this.hit(x, y)) { return }
			if (this.isDisabled()) { return }
			if (Asc.editor.asc_canMoveAnimationLater()) {
				if (Asc.editor.asc_IsStartedAnimationPreview()) {
					Asc.editor.asc_StopAnimationPreview()
				}
				Asc.editor.asc_moveAnimationLater()
			}
		}

		function closePanel(event, x, y) {
			if (!this.hit(x, y)) { return }
			if (this.isDisabled()) { return }
			Asc.editor.asc_ShowAnimPane(false)
		}

		// --- end of event handlers for buttons of CAnimPaneHeader
	}

	InitClass(CAnimPaneHeader, CTopControl, CONTROL_TYPE_HEADER);

	CAnimPaneHeader.prototype.recalculateChildrenLayout = function () {
		this.label.setLayout(
			AscCommon.TIMELINE_LEFT_MARGIN,
			0,
			this.playButton.getLeft(),
			this.getHeight()
		);
		this.playButton.setLayout(
			PLAY_BUTTON_LEFT,
			PLAY_BUTTON_TOP,
			PLAY_BUTTON_WIDTH,
			PLAY_BUTTON_HEIGHT
		);
		this.moveUpButton.setLayout(
			MOVE_UP_BUTTON_LEFT,
			MOVE_UP_BUTTON_TOP,
			MOVE_UP_BUTTON_WIDTH,
			MOVE_UP_BUTTON_HEIGHT
		);
		this.moveDownButton.setLayout(
			MOVE_DOWN_BUTTON_LEFT,
			MOVE_DOWN_BUTTON_TOP,
			MOVE_DOWN_BUTTON_WIDTH,
			MOVE_DOWN_BUTTON_HEIGHT
		);
		this.closeButton.setLayout(
			this.getWidth() - AscCommon.TIMELINE_LIST_RIGHT_MARGIN - BUTTON_SIZE,
			(this.getHeight() - BUTTON_SIZE) / 2,
			BUTTON_SIZE,
			BUTTON_SIZE
		);
	};
	CAnimPaneHeader.prototype.getFillColor = function () {
		return null;
	};
	CAnimPaneHeader.prototype.getOutlineColor = function () {
		return null;
	};


	function CTimelineContainer(oDrawer) {
		CTopControl.call(this, oDrawer);
		this.drawer = oDrawer;

		this.secondsButton = this.addControl(new CButton(
			this, null, null, manageTimelineScale));
		this.timeline = this.addControl(new CTimeline(this));

		function manageTimelineScale(event, x, y) {
			if (!this.hit(x, y)) { return }
			this.next.timeScaleIndex = (this.next.timeScaleIndex + 1) % TIME_SCALES.length
			this.next.onUpdate()

			// also updating seqList to redraw effect bars
			editor.WordControl.m_oAnimPaneApi.list.Control.seqList.onUpdateSeqList()
		}
	}

	InitClass(CTimelineContainer, CTopControl, CONTROL_TYPE_TIMELINE_CONTAINER);

	CTimelineContainer.prototype.recalculateChildrenLayout = function () {
		var dPosY = (this.getHeight() - SECONDS_BUTTON_HEIGHT) / 2;
		this.secondsButton.setLayout(SECONDS_BUTTON_LEFT, dPosY, SECONDS_BUTTON_WIDTH, SECONDS_BUTTON_HEIGHT);
		var dLeft = LABEL_TIMELINE_WIDTH + AscCommon.TIMELINE_LEFT_MARGIN - 1.5 * SCROLL_THICKNESS;
		var dWidth = this.getWidth() - AscCommon.TIMELINE_LIST_RIGHT_MARGIN - dLeft;
		dPosY = (this.getHeight() - SCROLL_THICKNESS) / 2;
		this.timeline.setLayout(dLeft, dPosY, dWidth, SCROLL_THICKNESS);
	};
	CTimelineContainer.prototype.getFillColor = function () {
		return null;
	};
	CTimelineContainer.prototype.getOutlineColor = function () {
		return null;
	};
	CTimelineContainer.prototype.draw = function (graphics) {
		if (!CTopControl.prototype.draw.call(this, graphics)) {
			return false;
		}
		// this.clipStart(graphics);
		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			this.children[nChild].draw(graphics);
		}
		// graphics.RemoveClipRect();
		// this.clipEnd(graphics);
		return true;
	};


	function CTimeline(oParentControl, oContainer, oChild) {
		CControlContainer.call(this, oParentControl);

		this.container = oContainer;
		this.scrolledChild = oChild;

		this.isScrollerHovered;
		this.isStickedToPointer;
		
		this.startButton = this.addControl(new CButton(this, onFirstBtnMouseDown, null, onMouseUp));
		this.endButton = this.addControl(new CButton(this, onSecondBtnMouseDown, null, onMouseUp));
		
		function onFirstBtnMouseDown(e, x, y) {
			if (!this.hit(x, y)) { return }
			this.parentControl.setEventListener(this);
			let step = SCROLL_STEP * this.parentControl.getWidth()
			this.parentControl.startScroll(-step);
			return true;
		}

		function onSecondBtnMouseDown(e, x, y) {
			if (!this.hit(x, y)) { return }
			this.parentControl.setEventListener(this);
			let step = SCROLL_STEP * this.parentControl.getWidth()
			this.parentControl.startScroll(step);
			return true;
		}

		function onMouseUp(e, x, y) {
			if (this.parentControl.isEventListener(this)) {
				this.parentControl.setEventListener(null);
				this.parentControl.endScroll();
				return true;
			}
			return false;
		}
		
		this.timerId = null;
		this.timeoutId = null;

		// This fields supposed to be private
		// so it should not be changed directly.
		// Use set methods insdead (setScrollOffset, setStartTime)
		this.scrollOffset = 0; // in millimeters
		this.startTime = 0; // in seconds
		this.timeScaleIndex = 2;

		// Tmp field for demoPreview
		this.tmpScrollOffset = null;

		// Labels cache
		this.labels = {};
		this.usedLabels = {};
		this.cachedParaPr = null

		this.onMouseDownCallback = function stickToPointer(event, x, y) {
			if (!this.hitInScroller(x, y)) { return }
			this.isStickedToPointer = true
			this.onUpdate()
		}

		this.onMouseUpCallback = function unstickFromPointer(event, x, y) {
			this.isStickedToPointer = false;
			if (this.isOnScroll()) { this.endScroll() }
			this.onUpdate()
		}

		this.onMouseMoveCallback = function handlePointerMovement(event, x, y) {
			// Updating hover state of the scroller
			const tmpIsScrollerHovered = this.hitInScroller(x, y);
			if (this.isScrollerHovered !== tmpIsScrollerHovered) {
				this.isScrollerHovered = tmpIsScrollerHovered;
				this.onUpdate()
			}

			if (!this.isStickedToPointer) { return }

			let oInv = this.getInvFullTransformMatrix();
			let tx = oInv.TransformPointX(x, y);

			let newScrollOffset = tx - this.getRulerStart() - TIMELINE_SCROLLER_SIZE / 2;

			// Check if the boundaried are reached and start scrolling if so
			let leftBorder = this.getRulerStart();
			let rightBorder = this.getRulerEnd()
			if (tx <= leftBorder || tx >= rightBorder) {
				if (!this.isOnScroll()) {
					let scrollStep = this.getWidth() * SCROLL_STEP / 10;
					scrollStep = tx <= leftBorder ? -scrollStep : scrollStep;
					let scrollTimerDelay = 0;
					let scrollTimerInterval = 50;
					this.startScroll(scrollStep, scrollTimerDelay, scrollTimerInterval);
				}
			}
			else this.endScroll()

			// Updating scrollOffset
			this.setScrollOffset(newScrollOffset)
		}
	}

	InitClass(CTimeline, CControlContainer, CONTROL_TYPE_TIMELINE);

	CTimeline.prototype.limitScrollOffset = function (newScrollOffset /* in millimeters */) {
		return Math.max(0, Math.min(newScrollOffset, this.getMaxScrollOffset()));
	};
	CTimeline.prototype.getScrollOffset = function () {
		return this.tmpScrollOffset !== null ? this.tmpScrollOffset : this.scrollOffset;
	};
	CTimeline.prototype.setScrollOffset = function (newScrollOffset /* in millimeters */) {
		let oldScrollOffset = this.getScrollOffset()

		this.scrollOffset = this.limitScrollOffset(newScrollOffset)

		let difference = this.posToTime(this.getScrollOffset()) - this.posToTime(oldScrollOffset) // difference in seconds
		this.setStartTime(this.getStartTime() + difference)

		this.parentControl.onScroll();
		this.onUpdate();
	};
	CTimeline.prototype.getMaxScrollOffset = function () {
		return this.getWidth() - 2 * SCROLL_BUTTON_SIZE - TIMELINE_SCROLLER_SIZE;
	};

	CTimeline.prototype.getStartTime = function () {
		return this.startTime;
	};
	CTimeline.prototype.setStartTime = function (newStartTime /* in seconds */) {
		this.startTime = Math.max(0, newStartTime)

		this.parentControl.onScroll();
		this.onUpdate();

		// also updating seqList to redraw effect bars
		editor.WordControl.m_oAnimPaneApi.list.Control.seqList.onUpdateSeqList()
	};
	CTimeline.prototype.getCurrentTime = function() {
		return this.posToTime(this.getScrollOffset() + this.startButton.getWidth() + TIMELINE_SCROLLER_SIZE / 2)
	}

	CTimeline.prototype.startScroll = function (step /* in millimeters */, scrollTimerDelay, scrollTimerInterval) {
		if (typeof scrollTimerDelay === 'undefined') { scrollTimerDelay = SCROLL_TIMER_DELAY }
		if (typeof scrollTimerInterval === 'undefined') { scrollTimerInterval = SCROLL_TIMER_INTERVAL }

		this.endScroll();
		var oScroll = this;
		oScroll.addScroll(step);

		this.timeoutId = setTimeout(function () {
			oScroll.timeoutId = null;
			oScroll.timerId = setInterval(function () {
				oScroll.addScroll(step);
			}, scrollTimerInterval);
		}, scrollTimerDelay);
	};
	CTimeline.prototype.addScroll = function (step /* in millimeters */) {
		let newStartTime = this.posToTime(this.getZeroShift() + step)

		const seqList = editor.WordControl.m_oAnimPaneApi.list.Control.seqList
		seqList.forEachAnimItem(function (animItem) {
			if (!animItem.hitResult) { return }
			animItem.handleTimelineScroll(step);
		})

		this.setStartTime(newStartTime)
	};
	CTimeline.prototype.endScroll = function () {
		if (this.timerId !== null) {
			clearInterval(this.timerId);
			this.timerId = null;
		}
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}

		this.setStateFlag(STATE_FLAG_SELECTED, false);
	};
	CTimeline.prototype.isOnScroll = function () {
		return this.timerId !== null || this.timeoutId !== null;
		// return this.timerId !== null || this.timeoutId !== null || this.parentControl.isEventListener(this);
	};

	CTimeline.prototype.startDrawLabels = function () {
		this.usedLabels = {};
	};
	CTimeline.prototype.endDrawLabels = function () {
		for (var nTime in this.labels) {
			if (!this.usedLabels[nTime]) {
				var oLabel = this.labels[nTime];
				oLabel.parentControl = null;
				oLabel.bDeleted = true;
				delete this.labels[nTime];
			}
		}
	};
	CTimeline.prototype.getLabel = function (nTime, scale) {
		this.usedLabels[nTime] = true;
		if (this.labels[nTime] && AscFormat.fApproxEqual(this.labels[nTime].scale, scale, 0.01)) {
			return this.labels[nTime];
		}
		return this.cacheLabel(nTime, scale);
	};
	CTimeline.prototype.cacheLabel = function (nTime, scale) {
		var oLabel = new CLabel(this, this.getTimeString(nTime), 7.5);
		var oContent = oLabel.txBody.content;
		oLabel.setLayout(0, 0, LABEL_WIDTH, this.getHeight());
		if (this.cachedParaPr) {
			oContent.Content[0].CompiledPr = this.cachedParaPr;
		} else {
			oContent.SetApplyToAll(true);
			oContent.SetParagraphAlign(AscCommon.align_Center);
			oContent.SetApplyToAll(false);
		}
		oLabel.recalculate();
		if (!this.cachedParaPr) {
			this.cachedParaPr = oContent.Content[0].CompiledPr;
		}
		var oBaseTexture = oLabel.getAnimTexture(scale);
		if (oBaseTexture) {
			this.labels[nTime] = new CAnimTexture(this, oBaseTexture.canvas, oBaseTexture.scale, oBaseTexture.x, oBaseTexture.y);
		}
		return this.labels[nTime];
	};
	CTimeline.prototype.getTimeString = function (nTime) {
		if (nTime < 60) {
			return "" + nTime;
		}

		const nSeconds = nTime % 60;
		const nMinutes = ((nTime / 60) >> 0) % 60;

		let sSeconds = padZero(nSeconds);
		let sMinutes = padZero(nMinutes);

		if (nTime < 3600) {
			return (sMinutes + ":") + sSeconds;
		}

		return (((nTime / 3600) >> 0) + ":") + sMinutes + ":" + sSeconds;

		function padZero(number) {
			return number < 10 ? "0" + number : "" + number;
		}
	};
	CTimeline.prototype.drawLabel = function (graphics, dPos, nTime) {
		var oLabelTexture = this.getLabel(nTime, graphics.m_oCoordTransform.sx);
		var oMatrix = new AscCommon.CMatrix();
		var dWidth = oLabelTexture.canvas.width / oLabelTexture.scale;
		var dHeight = oLabelTexture.canvas.height / oLabelTexture.scale;
		graphics.drawImage2(oLabelTexture.canvas,
			dPos - dWidth / 2, this.getHeight() / 2 - dHeight / 2,
			dWidth,
			dHeight);
		// var oContent = oLabel.txBody.content;
		// oContent.ShiftView(dPos - LABEL_WIDTH / 2, this.getHeight() / 2 - oContent.GetSummaryHeight() / 2);
		// oContent.Draw(0, graphics);
		// oContent.ResetShiftView();
	};
	CTimeline.prototype.drawMark = function (graphics, dPos) {
		var dHeight = this.getHeight() / 3;
		var nPenW = this.getPenWidth(graphics);
		graphics.drawVerLine(1, dPos, dHeight, dHeight + dHeight, nPenW);
	};
	CTimeline.prototype.start = function (graphics, dPos) {
		var dHeight = this.getHeight() / 3;
		var nPenW = this.getPenWidth(graphics);
		graphics.drawVerLine(1, dPos, dHeight, dHeight + dHeight, nPenW);
	};
	CTimeline.prototype.draw = function (graphics) {
		if (this.isHidden()) { return false }
		if (!this.checkUpdateRect(graphics.updatedRect)) { return false }

		graphics.SaveGrState();
		// var dPenW = this.getPenWidth(graphics);
		// graphics.SetIntegerGrid(true);
		// graphics.p_width(dPenW);
		// var sColor = this.children[0].getOutlineColor();
		// var oColor = AscCommon.RgbaHexToRGBA(sColor);
		// graphics.p_color(oColor.R, oColor.G, oColor.B, 255);
		// var dPaneLeft = this.children[0].getRight();
		// var dPaneWidth = this.getWidth() - (this.children[0].getWidth() + this.children[1].getWidth());
		// graphics.rect(dPaneLeft, 0, dPaneWidth, this.getHeight());
		// graphics.ds();
		// graphics.RestoreGrState();
		var oSkin = AscCommon.GlobalSkin;
		var sColor = oSkin.ScrollOutlineColor;
		var oColor = AscCommon.RgbaHexToRGBA(sColor);
		var dPaneLeft = this.getRulerStart();
		var dPaneWidth = this.getRulerEnd() - dPaneLeft;
		var x = dPaneLeft;
		var y = 0;
		var extX = dPaneWidth;
		var extY = this.getHeight();
		graphics.transform3(this.transform);
		graphics.SetIntegerGrid(true);
		var nPenW = this.getPenWidth(graphics);
		graphics.p_color(oColor.R, oColor.G, oColor.B, 0xFF);
		graphics.drawHorLine(0, y, x, x + extX, nPenW);
		graphics.drawHorLine(0, y + extY, x, x + extX, nPenW);
		graphics.drawVerLine(2, x, y, y + extY, nPenW);
		graphics.drawVerLine(2, x + extX, y, y + extY, nPenW);
		graphics.ds();

		//draw marks
		//find first visible
		var fStartTime = this.posToTime(this.getRulerStart());
		var fTimeInterval = TIME_SCALES[this.timeScaleIndex];
		var nMarksCount = TIME_INTERVALS[this.timeScaleIndex] === LONG_TIME_INTERVAL ? 10 : 2;

		var dTimeOfSmallInterval = fTimeInterval / nMarksCount;
		var nStartIntervalIdx = this.startTime / dTimeOfSmallInterval >> 0;
		var nEndIntervalIdx = this.posToTime(this.getRulerEnd()) / dTimeOfSmallInterval + 0.5 >> 0;
		this.startDrawLabels();

		graphics.SaveGrState();
		var nInterval;
		graphics.AddClipRect(x, y, extX, extY);
		for (nInterval = nStartIntervalIdx; nInterval <= nEndIntervalIdx; ++nInterval) {
			var dTime = nInterval * dTimeOfSmallInterval;
			var dPos = this.timeToPos(dTime);
			if (nInterval % nMarksCount !== 0) {
				this.drawMark(graphics, dPos);
			} else {
				this.drawLabel(graphics, dPos, dTime);
			}
		}
		graphics.ds();
		// for(nInterval = nFirstInterval; nInterval <= nLastInterval; ++nInterval) {
		//     var dTime = nInterval*dSmallInterval;
		//     var dPos = this.timeToPos(dTime);
		//     if(nInterval % nMarksCount === 0) {
		//         this.drawLabel(graphics, dPos, dTime);
		//     }
		// }

		graphics.RestoreGrState();
		this.endDrawLabels();
		//

		this.drawScroller(graphics);

		graphics.RestoreGrState();

		if (!CControlContainer.prototype.draw.call(this, graphics)) {
			return false;
		}
	};
	CTimeline.prototype.drawScroller = function (graphics) {
		let x = this.getRulerStart() + this.getScrollOffset();
		let y = 0;
		let extX = TIMELINE_SCROLLER_SIZE;
		let extY = this.getHeight();

		const oSkin = AscCommon.GlobalSkin;
		let sFillColor;
		let oColor;

		if (this.isStickedToPointer) {
			sFillColor = '#000'// oSkin.ScrollerActiveColor;
			oColor = AscCommon.RgbaHexToRGBA(sFillColor);
			graphics.b_color1(oColor.R, oColor.G, oColor.B, 0x80);
		} else if (this.isScrollerHovered) {
			sFillColor = '#000' // oSkin.ScrollerHoverColor;
			let oColor = AscCommon.RgbaHexToRGBA(sFillColor);
			graphics.b_color1(oColor.R, oColor.G, oColor.B, 0x40);
		} else {
			sFillColor = '#000';
			let oColor = AscCommon.RgbaHexToRGBA(sFillColor);
			graphics.b_color1(oColor.R, oColor.G, oColor.B, 0x0);
		}

		graphics.rect(x, y, extX, extY);
		graphics.df();

		let nPenW = this.getPenWidth(graphics);
		graphics.p_color(0, 0, 0, 0xFF);
		graphics.drawHorLine(0, y, x, x + extX, nPenW);
		graphics.drawHorLine(0, y + extY, x, x + extX, nPenW);
		graphics.drawVerLine(2, x, y, y + extY, nPenW);
		graphics.drawVerLine(2, x + extX, y, y + extY, nPenW);

		if (this.tmpScrollOffset !== null) {
			graphics.SaveGrState();
			graphics.RemoveClipRect();

			// const seqList = Asc.editor.WordControl.m_oAnimPaneApi.list.Control.seqList
			// graphics.drawVerLine(1, x + extX / 2, seqList.getTop(), y, nPenW);
			graphics.drawVerLine(1, x + extX / 2, y - 1000, y, nPenW);

			graphics.RestoreGrState();
		}

		return true;
	};
	CTimeline.prototype.hitInScroller = function(x, y) {
		// x, y - relatively to this.parentContainer
		// tx, ty - relatively to this

		let oInv = this.getInvFullTransformMatrix();
		let tx = oInv.TransformPointX(x, y);
		let ty = oInv.TransformPointY(x, y);

		let l = this.getRulerStart() + this.getScrollOffset();
		let t = 0;
		let r = l + TIMELINE_SCROLLER_SIZE;
		let b = t + this.getHeight();

		return tx >= l && tx <= r && ty >= t && ty <= b;
	}

	CTimeline.prototype.onPreviewStart = function() {
		this.demoTiming = Asc.editor.WordControl.m_oLogicDocument.previewPlayer.timings[0];
		this.tmpScrollOffset = 0;

		Asc.editor.WordControl.m_oAnimPaneApi.timeline.OnPaint();
		Asc.editor.WordControl.m_oAnimPaneApi.list.OnPaint();
		// this.onUpdate();
	}
	CTimeline.prototype.onPreviewStop = function() {
		this.demoTiming = null;
		this.tmpScrollOffset = null;

		Asc.editor.WordControl.m_oAnimPaneApi.timeline.OnPaint();
		Asc.editor.WordControl.m_oAnimPaneApi.list.OnPaint();
		// this.onUpdate();
	}
	CTimeline.prototype.onPreview = function(elapsedTicks) {
		if (this.tmpScrollOffset === null) { return };
		if (!this.demoTiming) { return }

		let demoEffects = this.demoTiming.getRootSequences()[0].getAllEffects();
		let correction;
		demoEffects.forEach(function (effect) {
			let originalEffectStart = effect.originalNode.getBaseTime() + effect.originalNode.asc_getDelay();
			// let originalEffectEnd = originalEffectStart + effect.originalNode.asc_getDuration();

			let demoEffectStart = effect.getBaseTime() + effect.asc_getDelay();
			let demoEffectEnd = demoEffectStart + effect.asc_getDuration();

			if (demoEffectStart < elapsedTicks && elapsedTicks < demoEffectEnd) {
				correction = originalEffectStart - demoEffectStart;
			}
		})

		this.tmpScrollOffset = ms_to_mm(elapsedTicks + correction);

		// this.parentControl.drawer == editor.WordControl.m_oAnimPaneApi.timeline
		Asc.editor.WordControl.m_oAnimPaneApi.timeline.OnPaint();
		Asc.editor.WordControl.m_oAnimPaneApi.list.OnPaint();

		function ms_to_mm(nMilliseconds) {
			const index = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline.timeScaleIndex;
			return nMilliseconds * TIME_INTERVALS[index] / TIME_SCALES[index] / 1000;
		}
	}

	CTimeline.prototype.getRulerStart = function () {
		return this.startButton.getRight();
	};
	CTimeline.prototype.getRulerEnd = function () {
		return this.getWidth() - this.endButton.getWidth();
	};
	CTimeline.prototype.getZeroShift = function () {
		// Returns the value (in millimeters) of the left margin of the start of the ruler
		return this.getRulerStart() + TIMELINE_SCROLLER_SIZE / 2;
	};

	/*
	 * Functions to convert time to pos and vice versa
	 */
	CTimeline.prototype.getLinearCoeffs = function () {
		//linear relationship x = a*t + b
		var a = TIME_INTERVALS[this.timeScaleIndex] / TIME_SCALES[this.timeScaleIndex];
		var b = this.getZeroShift() - a * this.startTime;
		return { a: a, b: b };
	};
	CTimeline.prototype.timeToPos = function (fTime) {
		//linear relationship x = a*t + b
		var oCoefs = this.getLinearCoeffs();
		return oCoefs.a * fTime + oCoefs.b;
	};
	CTimeline.prototype.posToTime = function (fPos) {
		//linear relationship x = a*t + b 
		var oCoefs = this.getLinearCoeffs();
		return (fPos - oCoefs.b) / oCoefs.a;
	};

	CTimeline.prototype.getFillColor = function () {
		return null;
	};
	CTimeline.prototype.getOutlineColor = function () {
		return null;
	};
	CTimeline.prototype.canHandleEvents = function () {
		return true;
	};
	CTimeline.prototype.recalculateChildrenLayout = function () {
		this.startButton.setLayout(0, 0, SCROLL_BUTTON_SIZE, SCROLL_BUTTON_SIZE);
		this.endButton.setLayout(this.getWidth() - SCROLL_BUTTON_SIZE, 0, SCROLL_BUTTON_SIZE, SCROLL_BUTTON_SIZE);

		const currentScrollOffset = this.getScrollOffset()
		if (currentScrollOffset >= this.getMaxScrollOffset()) {
			this.setScrollOffset(currentScrollOffset)
		}
	};
	CTimeline.prototype.onMouseDown = function (e, x, y) {
		if (this.onMouseDownCallback && this.onMouseDownCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseDown.call(this, e, x, y);
	};
	CTimeline.prototype.onMouseMove = function (e, x, y) {
		if (this.onMouseMoveCallback && this.onMouseMoveCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseMove.call(this, e, x, y);
	};
	CTimeline.prototype.onMouseUp = function (e, x, y) {
		if (this.onMouseUpCallback && this.onMouseUpCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseUp.call(this, e, x, y);
	};


	function CSeqListContainer(oDrawer) {
		CTopControl.call(this, oDrawer);
		this.seqList = this.addControl(new CSeqList(this));

		this.onMouseDownCallback = function clearSelection(event, x, y) {
			if (this.seqList.hit(x, y)) { return }

			this.seqList.forEachAnimItem(function (animItem) { animItem.effect.deselect() })
			Asc.editor.WordControl.m_oLogicDocument.RedrawCurSlide()
			Asc.editor.WordControl.m_oLogicDocument.Document_UpdateInterfaceState()
		}
	}

	InitClass(CSeqListContainer, CTopControl, CONTROL_TYPE_SEQ_LIST_CONTAINER);

	CSeqListContainer.prototype.recalculateChildrenLayout = function () {
		this.seqList.setLayout(
			AscCommon.TIMELINE_LEFT_MARGIN,
			0,
			this.getWidth() - AscCommon.TIMELINE_LEFT_MARGIN - AscCommon.TIMELINE_LIST_RIGHT_MARGIN,
			this.seqList.getHeight());
		this.seqList.recalculate();
		this.setLayout(0, 0, this.getWidth(), this.seqList.getHeight());
	};

	CSeqListContainer.prototype.onScroll = function () {
		this.onUpdate();
	};
	CSeqListContainer.prototype.onMouseWheel = function (e, deltaY, X, Y) {
		return false;
	};
	CSeqListContainer.prototype.onMouseDown = function (e, x, y) {
		if (this.onMouseDownCallback && this.onMouseDownCallback.call(this, e, x, y)) {
			return true;
		}
		return CTopControl.prototype.onMouseDown.call(this, e, x, y);
	};
	
	CSeqListContainer.prototype.getFillColor = function () {
		return null;
	};
	CSeqListContainer.prototype.getOutlineColor = function () {
		return null;
	};


	function CSeqList(oParentControl) {
		CControlContainer.call(this, oParentControl);
		// this.children - mainSeq, interactiveSeq 
	}

	InitClass(CSeqList, CControlContainer, CONTROL_TYPE_SEQ_LIST);

	CSeqList.prototype.recalculateChildren = function () {
		this.clear();

		const oTiming = this.getTiming();
		if (!oTiming) { return }

		const aAllSeqs = oTiming.getRootSequences();
		let oLastSeqView = null; // Зачем нужна эта переменная?
		for (var nSeq = 0; nSeq < aAllSeqs.length; ++nSeq) {
			const oSeqView = new CAnimSequence(this, aAllSeqs[nSeq]);
			this.addControl(oSeqView);
			oLastSeqView = oSeqView;
		}
	};
	CSeqList.prototype.recalculateChildrenLayout = function () {
		let dLastBottom = 0;

		for (let nChild = 0; nChild < this.children.length; ++nChild) {
			const oSeq = this.children[nChild];
			oSeq.setLayout(0, dLastBottom, this.getWidth(), 0);
			oSeq.recalculate();
			dLastBottom = oSeq.getBottom();
		}
		this.setLayout(this.getLeft(), this.getTop(), this.getWidth(), dLastBottom);
	};

	CSeqList.prototype.draw = function (graphics) {
		if (!CControlContainer.prototype.draw.call(this, graphics)) { return false; }

		for (var nChild = 0; nChild < this.children.length; ++nChild) {
			this.children[nChild].draw(graphics);
		}

		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		if (timeline.tmpScrollOffset !== null) {
			graphics.SaveGrState();
			graphics.RemoveClipRect();

			const xCord = timeline.getLeft() + timeline.getZeroShift() + timeline.tmpScrollOffset;
			const height = this.parentControl.drawer.GetHeight();
			graphics.drawVerLine(1, xCord, this.getTop(), this.getTop() + height, this.getPenWidth(graphics));

			graphics.RestoreGrState();
		}

		return true;
	}

	CSeqList.prototype.getFillColor = function () {
		return null;
	};
	CSeqList.prototype.getOutlineColor = function () {
		return null;
	};

	CSeqList.prototype.onUpdateSeqList = function () {
		if (Asc.editor.WordControl.m_oAnimPaneApi.list.Control) {
			this.onUpdate()
		}
	}

	CSeqList.prototype.checkCachedTexture = function (graphics) {
		var dGraphicsScale = graphics.m_oCoordTransform.sx;
		if (this.cachedCanvas) {
			var dScale = this.cachedCanvas.scale;
			if (AscFormat.fApproxEqual(dScale, dGraphicsScale)) {
				return this.cachedCanvas;
			}
		}
		this.bDrawTexture = true;
		var oBaseTexture = this.getAnimTexture(dGraphicsScale);
		if (oBaseTexture) {
			this.cachedCanvas = new CAnimTexture(this, oBaseTexture.canvas, oBaseTexture.scale, oBaseTexture.x, oBaseTexture.y);
		}
		else {
			this.cachedCanvas = null;
		}
		this.bDrawTexture = false;
		return this.cachedCanvas;
	};
	CSeqList.prototype.clearCachedTexture = function () {
		if (this.cachedCanvas) {
			this.cachedCanvas = null;
		}
	};

	CSeqList.prototype.forEachAnimItem = function (callback) {
		// here: this === Asc.editor.WordControl.m_oAnimPaneApi.list.Control.seqList;
		this.children.forEach(function (seq) {
			seq.animGroups.forEach(function (group) {
				group.children.forEach(function (animItem) {
					callback(animItem)
				})
			})
		})
	}


	// mainSeq or interactiveSeq
	function CAnimSequence(oParentControl, oSeq) {
		CControlContainer.call(this, oParentControl);
		this.seq = oSeq;
		this.label = null; //this.addControl(new CLabel(this, "seq"));
		this.animGroups = [];
	}

	InitClass(CAnimSequence, CControlContainer, CONTROL_TYPE_ANIM_SEQ);

	CAnimSequence.prototype.getSeq = function () {
		return this.seq;
	};

	CAnimSequence.prototype.recalculateChildren = function () {
		this.clear();

		let sLabel = this.seq.getLabel();
		if (typeof sLabel === "string" && sLabel.length > 0) {
			this.label = this.addControl(new CLabel(this, sLabel, 9, true, AscCommon.align_Left));
		}

		const aAllEffects = this.seq.getAllEffects();
		const animGroups = groupBy(aAllEffects, function (effect) { return effect.getIndexInSequence(); })

		for (let indexInSequence in animGroups) {
			const oAnimGroup = this.addControl(new CAnimGroup(this, animGroups[indexInSequence]));
			this.animGroups[this.animGroups.length] = oAnimGroup;
		}

		// Own realization of Object.groupBy for IE11 compatibility
		function groupBy(arr, callback) {
			return arr.reduce(function (storage, item) {
				let group = callback(item);
				storage[group] = storage[group] || [];
				storage[group].push(item);
				return storage;
			}, {});
		}
	};
	CAnimSequence.prototype.recalculateChildrenLayout = function () {
		var dCurY = 0;
		if (this.label) {
			dCurY += PADDING_TOP;
			this.label.setLayout(PADDING_TOP, dCurY, this.getWidth(), SEQ_LABEL_HEIGHT);
			this.label.recalculate();
			dCurY += this.label.getHeight() + PADDING_BOTTOM;
		}
		for (let nGroup = 0; nGroup < this.animGroups.length; ++nGroup) {
			this.animGroups[nGroup].setLayout(0, dCurY, this.getWidth(), 0);
			this.animGroups[nGroup].recalculate();
			dCurY += this.animGroups[nGroup].getHeight();
		}
		this.setLayout(this.getLeft(), this.getTop(), this.getWidth(), dCurY);
	};

	CAnimSequence.prototype.getFillColor = function () {
		return null;
	};
	CAnimSequence.prototype.getOutlineColor = function () {
		return null;
	};


	function CAnimGroup(oParentControl, aAllGroupEffects) {
		CControlContainer.call(this, oParentControl);
		this.effects = aAllGroupEffects;
	}

	InitClass(CAnimGroup, CControlContainer, CONTROL_TYPE_ANIM_GROUP_LIST);

	CAnimGroup.prototype.getSeq = function () {
		return this.parentControl.getSeq();
	};

	const INDEX_LABEL_WIDTH = 5

	CAnimGroup.prototype.recalculateChildren = function () {
		this.clear();

		for (let nCurEffect = this.effects.length - 1; nCurEffect >= 0; --nCurEffect) {
			const oItem = new CAnimItem(this, this.effects[nCurEffect]);
			this.addControl(oItem);
		}
	};
	CAnimGroup.prototype.recalculateChildrenLayout = function () {
		let dLastBottom = 0;

		for (let nChild = 0; nChild < this.children.length; ++nChild) {
			let oChild = this.children[nChild];
			oChild.setLayout(0, dLastBottom, this.getWidth(), ANIM_ITEM_HEIGHT);
			oChild.recalculate();
			dLastBottom = oChild.getBottom();
		}
		this.setLayout(this.getLeft(), this.getTop(), this.getWidth(), dLastBottom);
	};

	CAnimGroup.prototype.getFillColor = function () {
		return null;
	};
	CAnimGroup.prototype.getOutlineColor = function () {
		return null;
	};

	CAnimGroup.prototype.draw = function(graphics) {
		if (this.isHidden()) { return false; }
		if (!this.checkUpdateRect(graphics.updatedRect)) { return false; }
		if (!CControlContainer.prototype.draw.call(this, graphics)) { return false; }

		let bShouldDraw = false;
		this.effects.some(function (effect) {
			if (effect.isSelected()) return bShouldDraw = true;
		})
		if (!bShouldDraw) { return }

		const oThis = this;
		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		const timelineShift = ms_to_mm(timeline.getStartTime() * 1000);

		let afterItems = []
		this.children.forEach(function (animItem) {
			if (animItem.effect.isAfterEffect()) afterItems[afterItems.length] = animItem;
		})
		if (afterItems.length === 0) { return }

		graphics.SaveGrState();
		graphics.AddClipRect(afterItems[0].getLeftBorder(), oThis.getTop(), afterItems[0].getRightBorder() - afterItems[0].getLeftBorder(), oThis.getBottom() - oThis.getTop());

		for (let i = 0; i < afterItems.length; i++) {
			const animItem = afterItems[i];
			
			if (animItem.effect === this.effects[this.effects.length - 1]) {
				// effects in group are arranged backwards
				continue;
			}

			const align = 0;
			const x = ms_to_mm(animItem.effect.getBaseTime()) + animItem.getLeftBorder() - timelineShift;
			let top = afterItems[i-1] ? oThis.getTop() + afterItems[i-1].getTop() : oThis.getTop();
			let bottom = afterItems[i+1] ? oThis.getTop() + afterItems[i+1].getTop() : oThis.getBottom();

			graphics.drawVerLine(align, x, top, bottom, oThis.getPenWidth(graphics));
		}

		graphics.RestoreGrState();

		function ms_to_mm(nMilliseconds) {
			const index = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline.timeScaleIndex;
			return nMilliseconds * TIME_INTERVALS[index] / TIME_SCALES[index] / 1000;
		}
	}


	function CAnimItem(oParentControl, oEffect) {
		CControlContainer.call(this, oParentControl);
		this.effect = oEffect;

		if (this.effect.isClickEffect() || !this.effect.getPreviousEffect()) {
			this.indexLabel = this.addControl(new CLabel(this, this.effect.getIndexInSequence() + "", 7.5, false, 2))
		}

		this.eventTypeImage = this.addControl(new CImageControl(this));
		this.effectTypeImage = this.addControl(new CImageControl(this));
		this.effectLabel = this.addControl(new CLabel(this, this.effect.getObjectName(), 7.5));
		this.contextMenuButton = this.addControl(new CButton(this, showContextMenu));

		function showContextMenu(e, x, y) {
			if (!this.hit(x, y)) { return }
			console.log('showContextMenu on effect', this.parentControl.effect.Id);
		}

		// Temp fields for effect bar movement
		this.tmpDelay = null;
		this.tmpDuration = null;
		this.tmpRepeatCount = null;

		// Callback functions for effect bar events
		this.onMouseDownCallback = function (event, x, y) {
			if (!this.hit(x, y)) { return }
			
			this.updateSelectState(event);

			const hitRes = this.hitInEffectBar(x, y);
			if (hitRes) {
				this.hitResult = hitRes;
				this.tmpDelay = this.getDelay();
				this.tmpDuration = this.getDuration();

				if (this.effect.isUntilEffect() && hitRes.type === 'right') {
					this.tmpRepeatCount = this.getRepeatCount();
					this.initialTmpRepeatCount = this.tmpRepeatCount;
				}

				this.onUpdate();
			}
		}
		this.onMouseMoveCallback = function (event, x, y) {
			if (this.hit(x, y)) {
				this.updateCursorType(x, y);
			}

			if (!this.hitResult) { return }
			this.handleMovement(x, y);
			this.handleScrollCondition(x, y);

			this.onUpdate();
		}
		this.onMouseUpCallback = function (event, x, y) {
			if (!this.hitResult) { return }
			this.setNewEffectParams(this.tmpDelay, this.tmpDuration, this.tmpRepeatCount);
			this.hitResult = this.tmpDelay = this.tmpDuration = this.tmpRepeatCount = null;

			this.onUpdate()
		}
	}

	InitClass(CAnimItem, CControlContainer, CONTROL_TYPE_ANIM_ITEM);

	CAnimItem.prototype.recalculateChildrenLayout = function () {
		const dYInside = (this.getHeight() - EFFECT_BAR_HEIGHT) / 2;

		if (this.indexLabel) this.indexLabel.setLayout(0, 0, ANIM_ITEM_HEIGHT, ANIM_ITEM_HEIGHT)

		this.eventTypeImage.setLayout(INDEX_LABEL_WIDTH, dYInside, EFFECT_BAR_HEIGHT, EFFECT_BAR_HEIGHT);
		this.effectTypeImage.setLayout(this.eventTypeImage.getRight(), dYInside, EFFECT_BAR_HEIGHT, EFFECT_BAR_HEIGHT);
		this.effectLabel.setLayout(this.effectTypeImage.getRight(), dYInside, 20, EFFECT_BAR_HEIGHT);

		let dRightSpace = dYInside;
		this.contextMenuButton.setLayout(this.getRight() - ANIM_ITEM_HEIGHT + dRightSpace, dYInside, EFFECT_BAR_HEIGHT, EFFECT_BAR_HEIGHT);
	};

	CAnimItem.prototype.updateSelectState = function (event) {
		const oThis = this
		if (event.CtrlKey) {
			oThis.effect.toggleSelect()
		} else {
			const seqList = Asc.editor.WordControl.m_oAnimPaneApi.list.Control.seqList
			seqList.forEachAnimItem(function (animItem) {
				animItem.effect === oThis.effect ? animItem.effect.select() : animItem.effect.deselect()
			})
		}
		Asc.editor.WordControl.m_oLogicDocument.RedrawCurSlide()
		Asc.editor.WordControl.m_oLogicDocument.Document_UpdateInterfaceState()
	}
	CAnimItem.prototype.updateCursorType = function (x, y) {
		const hitRes = this.hitResult || this.hitInEffectBar(x, y);
		
		const cursorTypes = {
			'left': 'col-resize',
			'right': 'col-resize',
			'partition': 'col-resize',
			'center': 'ew-resize'
		};
		const cursorType = hitRes ? cursorTypes[hitRes.type] : 'default';
		
		const animPane = Asc.editor.WordControl.m_oAnimPaneApi;
		animPane.SetCursorType(cursorType);
	}
	CAnimItem.prototype.handleScrollCondition = function (x, y) {
		const leftBorder = this.getLeftBorder();
		const rightBorder = this.getRightBorder();

		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		if (x <= leftBorder || x >= rightBorder) {
			if (!timeline.isOnScroll()) {
				let scrollStep = timeline.getWidth() * SCROLL_STEP / 10;
				scrollStep = x <= leftBorder ? -scrollStep : scrollStep;
				let scrollTimerDelay = 0;
				let scrollTimerInterval = 50;
				timeline.startScroll(scrollStep, scrollTimerDelay, scrollTimerInterval);
			}
		} else timeline.endScroll();
	}
	CAnimItem.prototype.handleMovement = function (x, y) {
		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		const timelineShift = this.ms_to_mm(timeline.getStartTime() * 1000);
		const repeats = this.getRepeatCount() / 1000;

		let pointOfLanding = x - this.getLeftBorder() + timelineShift;

		if (this.hitResult.type === 'right') {
			if (this.effect.isUntilEffect()) {
				const pointOfContact = this.ms_to_mm(this.effect.getBaseTime() + this.effect.asc_getDelay() + this.effect.asc_getDuration() * this.initialTmpRepeatCount / 1000);
				let diff = this.mm_to_ms(pointOfLanding - pointOfContact);

				const newTmpRepeatCount = this.initialTmpRepeatCount + diff / (this.effect.asc_getDuration() / 1000);
				this.tmpRepeatCount = Math.max(newTmpRepeatCount, MIN_ALLOWED_REPEAT_COUNT);
			} else {
				const pointOfContact = this.ms_to_mm(this.effect.getBaseTime() + this.effect.asc_getDelay() + this.effect.asc_getDuration() * repeats);
				let diff = this.mm_to_ms(pointOfLanding - pointOfContact);

				const newTmpDuration = this.effect.asc_getDuration() + diff / repeats;
				this.tmpDuration = Math.max(MIN_ALLOWED_DURATION, newTmpDuration);
			}
		}

		if (this.hitResult.type === 'left') {
			const pointOfContact = this.ms_to_mm(this.effect.getBaseTime() + this.effect.asc_getDelay());
			const diff = this.mm_to_ms(pointOfLanding - pointOfContact);

			const newTmpDuration = this.effect.asc_getDuration() - diff / repeats;
			const newTmpDelay = this.effect.asc_getDelay() + diff;

			const maxNewTmpDuration = this.effect.asc_getDelay() / repeats + this.effect.asc_getDuration();
			const maxNewTmpDelay = this.effect.asc_getDelay() + (this.effect.asc_getDuration() - MIN_ALLOWED_DURATION) * repeats;

			if (this.effect.isUntilEffect()) {
				this.tmpDelay = Math.max(newTmpDelay, 0);
			} else {
				this.tmpDuration = Math.min(Math.max(newTmpDuration, MIN_ALLOWED_DURATION), maxNewTmpDuration);
				this.tmpDelay = Math.min(Math.max(newTmpDelay, 0), maxNewTmpDelay);
			}
		}

		if (this.hitResult.type === 'center') {
			const pointOfContact = this.ms_to_mm(this.effect.getBaseTime() + this.effect.asc_getDelay()) + this.hitResult.offset;
			const diff = this.mm_to_ms(pointOfLanding - pointOfContact);

			const newTmpDelay = this.effect.asc_getDelay() + diff;
			this.tmpDelay = Math.max(newTmpDelay, 0);
		}

		if (this.hitResult.type === 'partition') {
			const pointOfContact = this.ms_to_mm(this.effect.getBaseTime() + this.effect.asc_getDelay() + this.effect.asc_getDuration() * this.hitResult.index);
			const diff = this.mm_to_ms(pointOfLanding - pointOfContact);

			const newTmpDuration = this.effect.asc_getDuration() + diff / this.hitResult.index;
			this.tmpDuration = Math.max(MIN_ALLOWED_DURATION, newTmpDuration);
		}
	}
	CAnimItem.prototype.handleTimelineScroll = function (step) {
		if (!this.hitResult) { return }

		// this.tmpDelay = null;
		// this.tmpDuration = null;
		// this.tmpRepeatCount = null;

		const repeats = this.getRepeatCount() / 1000;
		const diff = this.mm_to_ms(step);
		let newTmpDelay;
		let newTmpDuration;
		let newTmpRepeatCount;
		switch (this.hitResult.type) {
			case 'center':
				newTmpDelay = this.tmpDelay + diff;
				this.tmpDelay = Math.max(newTmpDelay, 0);
				break;

			case 'right':
				if (this.effect.isUntilEffect()) {
					newTmpRepeatCount = this.tmpRepeatCount + diff / (this.effect.asc_getDuration() / 1000);
					this.tmpRepeatCount = Math.max(newTmpRepeatCount, MIN_ALLOWED_REPEAT_COUNT);
				} else {
					newTmpDuration = this.tmpDuration + diff / repeats;
					this.tmpDuration = Math.max(MIN_ALLOWED_DURATION, newTmpDuration);
				}
				break;

			case 'left':
				newTmpDuration = this.tmpDuration - diff / repeats;
				newTmpDelay = this.tmpDelay + diff;

				const maxNewTmpDuration = this.effect.asc_getDelay() / repeats + this.effect.asc_getDuration();
				const maxNewTmpDelay = this.effect.asc_getDelay() + (this.effect.asc_getDuration() - MIN_ALLOWED_DURATION) * repeats;

				if (this.effect.isUntilEffect()) {
					this.tmpDelay = Math.max(newTmpDelay, 0);
				} else {
					this.tmpDuration = Math.min(Math.max(newTmpDuration, MIN_ALLOWED_DURATION), maxNewTmpDuration);
					this.tmpDelay = Math.min(Math.max(newTmpDelay, 0), maxNewTmpDelay);
				}
				break;

			case 'partition':
				newTmpDuration = this.tmpDuration + diff / this.hitResult.index;
				this.tmpDuration = Math.max(MIN_ALLOWED_DURATION, newTmpDuration);
				break;
		}

		this.onUpdate();
	}

	CAnimItem.prototype.ms_to_mm = function (nMilliseconds) {
		if (nMilliseconds === null || nMilliseconds === undefined) { return }

		const index = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline.timeScaleIndex;
		return nMilliseconds * TIME_INTERVALS[index] / TIME_SCALES[index] / 1000;
	};
	CAnimItem.prototype.mm_to_ms = function (nMillimeters) {
		if (nMillimeters === null || nMillimeters === undefined) { return }

		const index = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline.timeScaleIndex;
		return nMillimeters / TIME_INTERVALS[index] * TIME_SCALES[index] * 1000;
	};

	CAnimItem.prototype.getDelay = function () {
		return this.tmpDelay !== null ? this.tmpDelay : this.effect.asc_getDelay()
	}
	CAnimItem.prototype.getDuration = function () {
		return this.tmpDuration !== null ? this.tmpDuration : this.effect.asc_getDuration()
	}
	CAnimItem.prototype.getRepeatCount = function () {
		if (this.tmpRepeatCount !== null) { return this.tmpRepeatCount; }
		else if (this.effect.asc_getRepeatCount() > 0) { return this.effect.asc_getRepeatCount(); }
		else {
			const bounds = this.getEffectBarBounds();
			const width = bounds.r - bounds.l;
			const totalWidth = this.getRightBorder() - bounds.l;
			return (totalWidth / width * 1000) >> 0; // approximate repeat counter
		}
	}

	CAnimItem.prototype.getLeftBorder = function () {
		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		return timeline.getLeft() + timeline.getZeroShift();
	}
	CAnimItem.prototype.getRightBorder = function () {
		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		return this.getLeftBorder() + timeline.getRulerEnd() - timeline.getZeroShift();
	}
	CAnimItem.prototype.getEffectBarBounds = function () {
		const timeline = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control.timeline;
		const timelineShift = timeline.getStartTime() * 1000;

		let l = this.ms_to_mm(this.effect.getBaseTime() + this.getDelay()) + this.getLeftBorder() - this.ms_to_mm(timelineShift);

		let r = l + this.ms_to_mm(this.getDuration());

		let t = this.bounds.t + (ANIM_ITEM_HEIGHT - EFFECT_BAR_HEIGHT) / 2;

		let b = t + EFFECT_BAR_HEIGHT;

		if (this.effect.isInstantEffect()) {
			return { l: l, r: l + EFFECT_BAR_HEIGHT, t: t, b: b }
		}

		return { l: l, r: r, t: t, b: b }
	};

	CAnimItem.prototype.draw = function drawEffectBar(graphics) {
		const timelineContainer = Asc.editor.WordControl.m_oAnimPaneApi.timeline.Control
		if (!timelineContainer) { return }

		if (!CControlContainer.prototype.draw.call(this, graphics)) { return false }
		if (this.isHidden()) { return false }
		if (!this.checkUpdateRect(graphics.updatedRect)) { return false }

		graphics.SaveGrState();

		const clipL = this.getLeftBorder();
		const clipT = this.bounds.t;
		const clipW = this.getRightBorder() - clipL;
		const clipH = this.bounds.b - this.bounds.t;
		graphics.AddClipRect(clipL, clipT, clipW, clipH);

		const oSkin = AscCommon.GlobalSkin;
		let sFillColor, sOutlineColor;
		let oFillColor, oOutlineColor;

		switch (this.effect.cTn.presetClass) {
			case AscFormat.PRESET_CLASS_ENTR:
				sFillColor = oSkin['animation-effect-entr-fill'];
				sOutlineColor = oSkin['animation-effect-entr-outline'];
				break;

			case AscFormat.PRESET_CLASS_EMPH:
				sFillColor = oSkin['animation-effect-emph-fill'];
				sOutlineColor = oSkin['animation-effect-emph-outline'];
				break;

			case AscFormat.PRESET_CLASS_EXIT:
				sFillColor = oSkin['animation-effect-exit-fill'];
				sOutlineColor = oSkin['animation-effect-exit-outline'];
				break;

			case AscFormat.PRESET_CLASS_PATH:
				sFillColor = oSkin['animation-effect-path-fill'];
				sOutlineColor = oSkin['animation-effect-path-outline'];
				break;
		}
		oFillColor = AscCommon.RgbaHexToRGBA(sFillColor);
		oOutlineColor = AscCommon.RgbaHexToRGBA(sOutlineColor);

		graphics.b_color1(oFillColor.R, oFillColor.G, oFillColor.B, 255);
		graphics.p_color(oOutlineColor.R, oOutlineColor.G, oOutlineColor.B, 255)

		const bounds = this.getEffectBarBounds();
		if (this.effect.isInstantEffect()) {
			// In case we need to draw a triangle

			let transform = graphics.m_oFullTransform;
			let left = (transform.TransformPointX(bounds.l, bounds.t) + 0.5) >> 0;
			let top = (transform.TransformPointY(bounds.l, bounds.t) + 0.5) >> 0;
			let right = (transform.TransformPointX(bounds.r, bounds.t) + 0.5) >> 0;
			let bottom = (transform.TransformPointY(bounds.l, bounds.b) + 0.5) >> 0;

			let ctx = graphics.m_oContext;
			ctx.beginPath();
			ctx.moveTo(left, top);
			ctx.lineTo(left + 5, top);
			ctx.lineTo(right, top + (bottom - top) / 2);
			ctx.lineTo(left + 5, bottom);
			ctx.lineTo(left, bottom);
			ctx.lineTo(left, top);
			graphics.df();
			graphics.ds();
		} else {
			let repeats;
			if (this.effect.isUntilEffect() && this.tmpRepeatCount === null) {
				// In case we need to draw an infinite bar with an arrow

				const barWidth = Math.max(this.getRightBorder() - bounds.l - EFFECT_BAR_HEIGHT, this.ms_to_mm(MIN_ALLOWED_DURATION));
				// repeats = barWidth / (bounds.r - bounds.l);
				repeats = this.getRepeatCount() / 1000;

				let transform = graphics.m_oFullTransform;
				let left = (transform.TransformPointX(bounds.l, bounds.t) + 0.5) >> 0;
				let top = (transform.TransformPointY(bounds.l, bounds.t) + 0.5) >> 0;
				let right = (transform.TransformPointX(bounds.l + barWidth, bounds.t) + 0.5) >> 0;
				let bottom = (transform.TransformPointY(bounds.l, bounds.b) + 0.5) >> 0;

				let ctx = graphics.m_oContext;
				ctx.beginPath();
				ctx.moveTo(left, top);
				ctx.lineTo(right, top);
				ctx.lineTo(right + 5, top);
				ctx.lineTo(right + EFFECT_BAR_HEIGHT * g_dKoef_mm_to_pix, top + (bottom - top) / 2);
				ctx.lineTo(right + 5, bottom);
				ctx.lineTo(right, bottom);
				ctx.lineTo(left, bottom);
				ctx.lineTo(left, top);
			} else {
				// In case we need to draw a bar

				repeats = this.getRepeatCount() / 1000;
				const barWidth = (bounds.r - bounds.l) * repeats;
				graphics.rect(bounds.l, bounds.t, barWidth, bounds.b - bounds.t);
			}

			graphics.df();
			graphics.ds();

			// draw marks
			if ((bounds.r - bounds.l) >= 2 * g_dKoef_pix_to_mm) {
				const gap = (bounds.b - bounds.t) / 5;
				for (let markIndex = 1; markIndex < repeats; markIndex++) {
					const xCord = bounds.l + markIndex * (bounds.r - bounds.l)
					graphics.drawVerLine(2, xCord, bounds.t + gap, bounds.b - gap, this.getPenWidth(graphics));
				}
			}
		}

		graphics.RestoreGrState();
	};
	CAnimItem.prototype.hitInEffectBar = function (x, y) {
		const bounds = this.getEffectBarBounds();
		const isOutOfBorders = x < this.getLeftBorder() || x > this.getRightBorder() || y < bounds.t || y > bounds.b
		if (isOutOfBorders) { return null; }

		const width = bounds.r - bounds.l;
		const repeats = this.getRepeatCount() / 1000;
		const delta = AscFormat.DIST_HIT_IN_LINE / 2

		let barRight = this.effect.isUntilEffect() ? this.getRightBorder() : bounds.l + width * repeats;
		barRight = Math.max(bounds.l + this.ms_to_mm(MIN_ALLOWED_DURATION), barRight);

		if (!this.effect.isInstantEffect()) {
			if (x >= bounds.l - delta && x <= bounds.l + delta) {
				return { type: 'left' };
			}

			if (x >= barRight - delta && x <= barRight + delta) {
				return { type: 'right' };
			}

			const partitionIndex = (x - bounds.l) / width >> 0;
			// if effect isUntilEffect condition (partitionIndex < repeats) doesnt matter
			if (partitionIndex > 0 && (this.effect.isUntilEffect() || partitionIndex < repeats)) {
				const partitionPos = bounds.l + partitionIndex * width;
				if (x <= partitionPos + delta && x >= partitionPos - delta) {
					return { type: 'partition', index: partitionIndex };
				}
			}
		}

		if (x > bounds.l && x < barRight) {
			return { type: 'center', offset: x - bounds.l };
		}

		return null;
	};


	CAnimItem.prototype.setNewEffectParams = function (newDelay, newDuration, newRepeatCount) {
		const minAllowedDelta = 1 // in ms
		const delayDiff = Math.abs(newDelay - this.effect.asc_getDelay());
		const durationDiff = Math.abs(newDuration - this.effect.asc_getDuration());
		const repeatCountDiff = Math.abs(newRepeatCount - this.effect.asc_getRepeatCount());

		const effectCopy = AscFormat.ExecuteNoHistory(function () {
			let oCopy = this.effect.createDuplicate();
			oCopy.merge(this.effect);
			return oCopy;
		}, this, []);

		if (newDelay !== null && newDelay !== undefined && delayDiff >= minAllowedDelta) {
			effectCopy.asc_putDelay(newDelay);
		}
		if (newDuration !== null && newDuration !== undefined && durationDiff >= minAllowedDelta) {
			effectCopy.asc_putDuration(newDuration);
		}
		if (newRepeatCount !== null && newRepeatCount !== undefined && repeatCountDiff >= 1) {
			effectCopy.asc_putRepeatCount(newRepeatCount);
		}

		if (this.effect.isEqualProperties(effectCopy)) { return }
		Asc.editor.WordControl.m_oLogicDocument.SetAnimationProperties(effectCopy);
	};


	CAnimItem.prototype.onMouseDown = function (e, x, y) {
		if (this.onMouseDownCallback && this.onMouseDownCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseDown.call(this, e, x, y);
	};
	CAnimItem.prototype.onMouseMove = function (e, x, y) {
		if (this.onMouseMoveCallback && this.onMouseMoveCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseMove.call(this, e, x, y);
	};
	CAnimItem.prototype.onMouseUp = function (e, x, y) {
		if (this.onMouseUpCallback && this.onMouseUpCallback.call(this, e, x, y)) {
			return true;
		}
		return CControlContainer.prototype.onMouseUp.call(this, e, x, y);
	};
	CAnimItem.prototype.canHandleEvents = function () {
		return true;
	};
	CAnimItem.prototype.getFillColor = function() {
		if (this.effect.isSelected()) return AscCommon.GlobalSkin.ScrollerActiveColor
		else if (this.isHovered()) return AscCommon.GlobalSkin.ScrollerHoverColor
		else return AscCommon.GlobalSkin.ScrollerColor;
	};
	CAnimItem.prototype.getOutlineColor = function () {
		return null;
	};


	// Header
	const PLAY_BUTTON_WIDTH = 82 * AscCommon.g_dKoef_pix_to_mm;
	const PLAY_BUTTON_HEIGHT = 24 * AscCommon.g_dKoef_pix_to_mm;
	const PLAY_BUTTON_LEFT = 145 * AscCommon.g_dKoef_pix_to_mm;
	const PLAY_BUTTON_TOP = 12 * AscCommon.g_dKoef_pix_to_mm;

	const MOVE_UP_BUTTON_WIDTH = 24 * AscCommon.g_dKoef_pix_to_mm;
	const MOVE_UP_BUTTON_HEIGHT = 24 * AscCommon.g_dKoef_pix_to_mm;
	const MOVE_UP_BUTTON_LEFT = 241 * AscCommon.g_dKoef_pix_to_mm;
	const MOVE_UP_BUTTON_TOP = 12 * AscCommon.g_dKoef_pix_to_mm;

	const MOVE_DOWN_BUTTON_WIDTH = 24 * AscCommon.g_dKoef_pix_to_mm;
	const MOVE_DOWN_BUTTON_HEIGHT = 24 * AscCommon.g_dKoef_pix_to_mm;
	const MOVE_DOWN_BUTTON_LEFT = MOVE_UP_BUTTON_WIDTH + 241 * AscCommon.g_dKoef_pix_to_mm;
	const MOVE_DOWN_BUTTON_TOP = 12 * AscCommon.g_dKoef_pix_to_mm;

	// Timeline
	const SECONDS_BUTTON_WIDTH = 76 * AscCommon.g_dKoef_pix_to_mm;
	const SECONDS_BUTTON_HEIGHT = 24 * AscCommon.g_dKoef_pix_to_mm;
	const SECONDS_BUTTON_LEFT = 57 * AscCommon.g_dKoef_pix_to_mm;

	const LEFT_TIMELINE_INDENT = 14 * AscCommon.g_dKoef_pix_to_mm;
	const LABEL_TIMELINE_WIDTH = 155 * AscCommon.g_dKoef_pix_to_mm;

	const SCROLL_TIMER_INTERVAL = 150;
	const SCROLL_TIMER_DELAY = 600;
	const SCROLL_STEP = 0.26

	//Time scales in seconds
	const TIME_SCALES = [0.25, 1, 1, 2, 5, 10, 20, 60, 120, 300, 600, 600];

	//lengths
	const SMALL_TIME_INTERVAL = 15;
	const MIDDLE_1_TIME_INTERVAL = 20;
	const MIDDLE_2_TIME_INTERVAL = 25;
	const LONG_TIME_INTERVAL = 30;

	const TIME_INTERVALS = [
		SMALL_TIME_INTERVAL,
		LONG_TIME_INTERVAL, //1
		SMALL_TIME_INTERVAL, //1
		SMALL_TIME_INTERVAL, //2
		MIDDLE_1_TIME_INTERVAL, //5
		MIDDLE_1_TIME_INTERVAL,//10
		MIDDLE_1_TIME_INTERVAL,//20
		MIDDLE_2_TIME_INTERVAL,//60
		MIDDLE_2_TIME_INTERVAL,//120
		MIDDLE_2_TIME_INTERVAL,//300
		MIDDLE_2_TIME_INTERVAL,//600
		SMALL_TIME_INTERVAL//600
	];

	const LABEL_WIDTH = 100;

	const HEADER_HEIGHT = 7.5;
	const BUTTON_SIZE = HEADER_HEIGHT;
	const TOOLBAR_HEIGHT = HEADER_HEIGHT;
	const PADDING_LEFT = 3;
	const PADDING_TOP = PADDING_LEFT;
	const PADDING_RIGHT = PADDING_LEFT;
	const PADDING_BOTTOM = PADDING_LEFT;
	const VERTICAL_SPACE = PADDING_LEFT;
	const HORIZONTAL_SPACE = PADDING_LEFT;
	const SCROLL_THICKNESS = 15 * AscCommon.g_dKoef_pix_to_mm;
	const SCROLL_BUTTON_SIZE = SCROLL_THICKNESS;
	const TIMELINE_SCROLLER_SIZE = SCROLL_BUTTON_SIZE;
	const TIMELINE_HEIGHT = SCROLL_THICKNESS + 1;
	const BUTTON_SPACE = HORIZONTAL_SPACE / 2;
	const TOOLBAR_WIDTH = 25;
	const ANIM_LABEL_WIDTH = 40;
	const ANIM_ITEM_HEIGHT = TIMELINE_HEIGHT;
	const EFFECT_BAR_HEIGHT = 2 * ANIM_ITEM_HEIGHT / 3;
	const SEQ_LABEL_HEIGHT = EFFECT_BAR_HEIGHT;

	// List
	const MIN_ALLOWED_DURATION = 10; // milliseconds
	const MIN_ALLOWED_REPEAT_COUNT = 10; // equals 0.01 of full effect duration


	window['AscCommon'] = window['AscCommon'] || {};
	window['AscCommon'].CAnimPaneHeader = CAnimPaneHeader;
	window['AscCommon'].CSeqListContainer = CSeqListContainer;
	window['AscCommon'].CTimelineContainer = CTimelineContainer;

	AscCommon.GlobalSkin['animation-effect-entr-fill'] = '#9edb86';
	AscCommon.GlobalSkin['animation-effect-entr-outline'] = '#386821';
	AscCommon.GlobalSkin['animation-effect-emph-fill'] = '#ffe87f';
	AscCommon.GlobalSkin['animation-effect-emph-outline'] = '#ca8310';
	AscCommon.GlobalSkin['animation-effect-exit-fill'] = '#ffcfc9';
	AscCommon.GlobalSkin['animation-effect-exit-outline'] = '#b54548';
	AscCommon.GlobalSkin['animation-effect-path-fill'] = '#a3c7d8';
	AscCommon.GlobalSkin['animation-effect-path-outline'] = '#274a68';
	// AscCommon.GlobalSkin['animation-effect-mediacall-fill'] =
	// AscCommon.GlobalSkin['animation-effect-mediacall-outline'] =
	// AscCommon.GlobalSkin['animation-effect-verb-fill'] =
	// AscCommon.GlobalSkin['animation-effect-verb-outline'] =
})(window);

