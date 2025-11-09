import { useMemo, useState, useRef } from "react";
import {
  Tab,
  Action,
  ObjectType,
  tableFieldHeight,
  tableHeaderHeight,
  tableColorStripHeight,
  tableWidth,
} from "../../data/constants";
import {
  IconEdit,
  IconMore,
  IconMinus,
  IconDeleteStroked,
  IconKeyStroked,
  IconLock,
  IconUnlock,
} from "@douyinfe/semi-icons";
import { Popover, Tag, Button, SideSheet } from "@douyinfe/semi-ui";
import { useLayout, useSettings, useDiagram, useSelect, useUndoRedo, useTransform } from "../../hooks";
import TableInfo from "../EditorSidePanel/TablesTab/TableInfo";
import { useTranslation } from "react-i18next";
import { dbToTypes } from "../../data/datatypes";
import { isRtl } from "../../i18n/utils/rtl";
import i18n from "../../i18n/i18n";
import { getTableHeight } from "../../utils/utils";

export default function Table({
  tableData,
  onPointerDown,
  setHoveredTable,
  handleGripField,
  setLinkingLine,
}) {
  /**
   * Table 组件
   * @param {Object}   props                    - 组件参数
   * @param {Object}   props.tableData          - 表数据对象（包含坐标、字段、颜色等）
   * @param {Function} props.onPointerDown      - 在表体按下时触发的处理函数
   * @param {Function} props.setHoveredTable    - 设置当前悬停的表/字段信息
   * @param {Function} props.handleGripField    - 字段拖拽起点处理函数
   * @param {Function} props.setLinkingLine     - 设置正在连接的线条状态
   * @returns {JSX.Element}                     - 渲染的表组件
   * @throws {Error}                            - 渲染或交互过程中可能抛出的错误
   */
  const [hoveredField, setHoveredField] = useState(null);
  // 组件级状态：是否正在调整宽度
  const [resizing, setResizing] = useState(false);
  // 组件级状态：是否展示左右拖动小蓝点（悬停时显示）
  const [showResizers, setShowResizers] = useState(false);
  // 引用：记录初始宽度与初始X坐标（用于左侧拖动同时移动X）
  const initialWidthRef = useRef(null);
  const initialXRef = useRef(null);
  const { database } = useDiagram();
  const { layout } = useLayout();
  const { deleteTable, deleteField, updateTable } = useDiagram();
  const { settings } = useSettings();
  const { t } = useTranslation();
  const { setUndoStack, setRedoStack } = useUndoRedo();
  const { transform } = useTransform();
  const {
    selectedElement,
    setSelectedElement,
    bulkSelectedElements,
    setBulkSelectedElements,
  } = useSelect();

  const borderColor = useMemo(
    () => (settings.mode === "light" ? "border-zinc-300" : "border-zinc-600"),
    [settings.mode],
  );

  const height = getTableHeight(tableData.fields);

  const isSelected = useMemo(() => {
    return (
      (selectedElement.id == tableData.id &&
        selectedElement.element === ObjectType.TABLE) ||
      bulkSelectedElements.some(
        (e) => e.type === ObjectType.TABLE && e.id === tableData.id,
      )
    );
  }, [selectedElement, tableData, bulkSelectedElements]);

  const lockUnlockTable = (e) => {
    const locking = !tableData.locked;
    updateTable(tableData.id, { locked: locking });

    const lockTable = () => {
      setSelectedElement({
        ...selectedElement,
        element: ObjectType.NONE,
        id: -1,
        open: false,
      });
      setBulkSelectedElements((prev) =>
        prev.filter(
          (el) => el.id !== tableData.id || el.type !== ObjectType.TABLE,
        ),
      );
    };

    const unlockTable = () => {
      const elementInBulk = {
        id: tableData.id,
        type: ObjectType.TABLE,
        initialCoords: { x: tableData.x, y: tableData.y },
        currentCoords: { x: tableData.x, y: tableData.y },
      };
      if (e.ctrlKey || e.metaKey) {
        setBulkSelectedElements((prev) => [...prev, elementInBulk]);
      } else {
        setBulkSelectedElements([elementInBulk]);
      }
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: false,
      }));
    };

    if (locking) {
      lockTable();
    } else {
      unlockTable();
    }
  };

  const openEditor = () => {
    if (!layout.sidebar) {
      setSelectedElement((prev) => ({
        ...prev,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: true,
      }));
    } else {
      setSelectedElement((prev) => ({
        ...prev,
        currentTab: Tab.TABLES,
        element: ObjectType.TABLE,
        id: tableData.id,
        open: true,
      }));
      if (selectedElement.currentTab !== Tab.TABLES) return;
      document
        .getElementById(`scroll_table_${tableData.id}`)
        .scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 注意：将小蓝点放在 foreignObject 之后渲染，以确保其在视觉和交互层级上位于顶部 */}

      <foreignObject
        key={tableData.id}
        x={tableData.x}
        y={tableData.y}
        width={tableData.width ?? tableWidth}
        height={height}
        className="group drop-shadow-lg rounded-md cursor-move"
        onPointerDown={onPointerDown}
        onPointerEnter={() => setShowResizers(true)}
        onPointerLeave={() => !resizing && setShowResizers(false)}
      >
        <div
          onDoubleClick={openEditor}
          className={`border-2 hover:border-dashed hover:border-blue-500
               select-none rounded-lg w-full ${
                 settings.mode === "light"
                   ? "bg-zinc-100 text-zinc-800"
                   : "bg-zinc-800 text-zinc-200"
               } ${isSelected ? "border-solid border-blue-500" : borderColor}`}
          style={{ direction: "ltr" }}
        >
          <div
            className="h-[10px] w-full rounded-t-md"
            style={{ backgroundColor: tableData.color }}
          />
          <div
            className={`overflow-hidden font-bold h-[40px] flex justify-between items-center border-b border-gray-400 ${
              settings.mode === "light" ? "bg-zinc-200" : "bg-zinc-900"
            }`}
          >
            <div className="px-3 overflow-hidden text-ellipsis whitespace-nowrap">
              {tableData.name}
              {tableData.comment && tableData.comment.trim() !== "" && (
                <span className="text-gray-500 ml-1">({tableData.comment})</span>
              )}
            </div>
            <div className="hidden group-hover:block">
              <div className="flex justify-end items-center mx-2 space-x-1.5">
                <Button
                  icon={tableData.locked ? <IconLock /> : <IconUnlock />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2f68adb3",
                  }}
                  disabled={layout.readOnly}
                  onClick={lockUnlockTable}
                />
                <Button
                  icon={<IconEdit />}
                  size="small"
                  theme="solid"
                  style={{
                    backgroundColor: "#2f68adb3",
                  }}
                  onClick={openEditor}
                />
                <Popover
                  key={tableData.id}
                  content={
                    <div className="popover-theme">
                      <div className="mb-2">
                        <strong>{t("comment")}:</strong>{" "}
                        {tableData.comment === "" ? (
                          t("not_set")
                        ) : (
                          <div>{tableData.comment}</div>
                        )}
                      </div>
                      <div>
                        <strong
                          className={`${
                            tableData.indices.length === 0 ? "" : "block"
                          }`}
                        >
                          {t("indices")}:
                        </strong>{" "}
                        {tableData.indices.length === 0 ? (
                          t("not_set")
                        ) : (
                          <div>
                            {tableData.indices.map((index, k) => (
                              <div
                                key={k}
                                className={`flex items-center my-1 px-2 py-1 rounded ${
                                  settings.mode === "light"
                                    ? "bg-gray-100"
                                    : "bg-zinc-800"
                                }`}
                              >
                                <i className="fa-solid fa-thumbtack me-2 mt-1 text-slate-500"></i>
                                <div>
                                  {index.fields.map((f) => (
                                    <Tag color="blue" key={f} className="me-1">
                                      {f}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        icon={<IconDeleteStroked />}
                        type="danger"
                        block
                        style={{ marginTop: "8px" }}
                        onClick={() => deleteTable(tableData.id)}
                        disabled={layout.readOnly}
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  }
                  position="rightTop"
                  showArrow
                  trigger="click"
                  style={{ width: "200px", wordBreak: "break-word" }}
                >
                  <Button
                    icon={<IconMore />}
                    type="tertiary"
                    size="small"
                    style={{
                      backgroundColor: "#808080b3",
                      color: "white",
                    }}
                  />
                </Popover>
              </div>
            </div>
          </div>
          {tableData.fields.map((e, i) => {
            return settings.showFieldSummary ? (
              <Popover
                key={i}
                content={
                  <div className="popover-theme">
                    <div
                      className="flex justify-between items-center pb-2"
                      style={{ direction: "ltr" }}
                    >
                      <p className="me-4 font-bold">{e.name}</p>
                      <p
                        className={
                          "ms-4 font-mono " + dbToTypes[database][e.type].color
                        }
                      >
                        {e.type +
                          ((dbToTypes[database][e.type].isSized ||
                            dbToTypes[database][e.type].hasPrecision) &&
                          e.size &&
                          e.size !== ""
                            ? "(" + e.size + ")"
                            : "")}
                      </p>
                    </div>
                    <hr />
                    {e.primary && (
                      <Tag color="blue" className="me-2 my-2">
                        {t("primary")}
                      </Tag>
                    )}
                    {e.unique && (
                      <Tag color="amber" className="me-2 my-2">
                        {t("unique")}
                      </Tag>
                    )}
                    {e.notNull && (
                      <Tag color="purple" className="me-2 my-2">
                        {t("not_null")}
                      </Tag>
                    )}
                    {e.increment && (
                      <Tag color="green" className="me-2 my-2">
                        {t("autoincrement")}
                      </Tag>
                    )}
                    <p>
                      <strong>{t("default_value")}: </strong>
                      {e.default === "" ? t("not_set") : e.default}
                    </p>
                    <p>
                      <strong>{t("comment")}: </strong>
                      {e.comment === "" ? t("not_set") : e.comment}
                    </p>
                  </div>
                }
                position="right"
                showArrow
                style={
                  isRtl(i18n.language)
                    ? { direction: "rtl" }
                    : { direction: "ltr" }
                }
              >
                {field(e, i)}
              </Popover>
            ) : (
              field(e, i)
            );
          })}
        </div>
      </foreignObject>

      {/* 左右拖动小蓝点：仅在非只读、未上锁时渲染。悬停时显示 */}
      {!layout.readOnly && !tableData.locked && (
        <>
          {/** 左侧小蓝点：同时调整width与x */}
          {(showResizers || resizing) && (
            <circle
              cx={tableData.x}
              cy={tableData.y + height / 2}
              r={4}
              fill={settings.mode === "light" ? "#3B82F6" : "#60A5FA"}
              stroke={settings.mode === "light" ? "#2563EB" : "#3B82F6"}
              style={{ cursor: "ew-resize" }}
              onPointerEnter={() => setShowResizers(true)}
              onPointerLeave={() => !resizing && setShowResizers(false)}
              onPointerDown={(e) => {
                try {
                  e.stopPropagation();
                  initialWidthRef.current = tableData.width ?? tableWidth;
                  initialXRef.current = tableData.x;
                  setResizing(true);
                  console.debug("[Table] 左侧拖动开始", {
                    width: initialWidthRef.current,
                    x: initialXRef.current,
                  });
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                } catch (err) {
                  console.error("[Table] 左侧拖动开始异常", err);
                }
              }}
              onPointerMove={(e) => {
                if (!resizing) return;
                const delta = e.movementX / (transform?.zoom || 1);
                const currentWidth = tableData.width ?? tableWidth;
                const MIN_TABLE_WIDTH = 180;
                let proposedWidth = currentWidth - delta;
                let proposedX = tableData.x + delta;
                if (proposedWidth < MIN_TABLE_WIDTH) {
                  const clampDelta = currentWidth - MIN_TABLE_WIDTH;
                  proposedWidth = MIN_TABLE_WIDTH;
                  proposedX = tableData.x + clampDelta;
                }
                if (proposedWidth !== currentWidth || proposedX !== tableData.x) {
                  updateTable(tableData.id, { width: proposedWidth, x: proposedX });
                }
              }}
              onPointerUp={(e) => {
                if (!resizing) return;
                setResizing(false);
                e.stopPropagation();
                const MIN_TABLE_WIDTH = 180;
                const finalWidth = Math.max(
                  MIN_TABLE_WIDTH,
                  tableData.width ?? tableWidth,
                );
                const finalX = tableData.x;
                const startWidth = initialWidthRef.current;
                const startX = initialXRef.current;
                console.debug("[Table] 左侧拖动结束", {
                  startWidth,
                  startX,
                  finalWidth,
                  finalX,
                });
                if (finalWidth !== startWidth || finalX !== startX) {
                  setUndoStack((prev) => [
                    ...prev,
                    {
                      action: Action.EDIT,
                      element: ObjectType.TABLE,
                      component: "resize",
                      tid: tableData.id,
                      undo: { width: startWidth, x: startX },
                      redo: { width: finalWidth, x: finalX },
                      message: t("edit_table", {
                        tableName: tableData.name,
                        extra: "[width/x]",
                      }),
                    },
                  ]);
                  setRedoStack([]);
                }
              }}
            />
          )}

          {/** 右侧小蓝点：仅调整width */}
          {(showResizers || resizing) && (
            <circle
              cx={tableData.x + (tableData.width ?? tableWidth)}
              cy={tableData.y + height / 2}
              r={4}
              fill={settings.mode === "light" ? "#3B82F6" : "#60A5FA"}
              stroke={settings.mode === "light" ? "#2563EB" : "#3B82F6"}
              style={{ cursor: "ew-resize" }}
              onPointerEnter={() => setShowResizers(true)}
              onPointerLeave={() => !resizing && setShowResizers(false)}
              onPointerDown={(e) => {
                try {
                  e.stopPropagation();
                  initialWidthRef.current = tableData.width ?? tableWidth;
                  setResizing(true);
                  console.debug("[Table] 右侧拖动开始", {
                    width: initialWidthRef.current,
                  });
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                } catch (err) {
                  console.error("[Table] 右侧拖动开始异常", err);
                }
              }}
              onPointerMove={(e) => {
                if (!resizing) return;
                const delta = e.movementX / (transform?.zoom || 1);
                const MIN_TABLE_WIDTH = 180;
                const currentWidth = tableData.width ?? tableWidth;
                const next = Math.max(MIN_TABLE_WIDTH, currentWidth + delta);
                if (next !== currentWidth) {
                  updateTable(tableData.id, { width: next });
                }
              }}
              onPointerUp={(e) => {
                if (!resizing) return;
                setResizing(false);
                e.stopPropagation();
                const MIN_TABLE_WIDTH = 180;
                const finalWidth = Math.max(
                  MIN_TABLE_WIDTH,
                  tableData.width ?? tableWidth,
                );
                const startWidth = initialWidthRef.current;
                console.debug("[Table] 右侧拖动结束", {
                  startWidth,
                  finalWidth,
                });
                if (finalWidth !== startWidth) {
                  setUndoStack((prev) => [
                    ...prev,
                    {
                      action: Action.EDIT,
                      element: ObjectType.TABLE,
                      component: "resize",
                      tid: tableData.id,
                      undo: { width: startWidth },
                      redo: { width: finalWidth },
                      message: t("edit_table", {
                        tableName: tableData.name,
                        extra: "[width]",
                      }),
                    },
                  ]);
                  setRedoStack([]);
                }
              }}
            />
          )}
        </>
      )}
      <SideSheet
        title={t("edit")}
        size="small"
        visible={
          selectedElement.element === ObjectType.TABLE &&
          selectedElement.id === tableData.id &&
          selectedElement.open &&
          !layout.sidebar
        }
        onCancel={() =>
          setSelectedElement((prev) => ({
            ...prev,
            open: !prev.open,
          }))
        }
        style={{ paddingBottom: "16px" }}
      >
        <div className="sidesheet-theme">
          <TableInfo data={tableData} />
        </div>
      </SideSheet>
    </>
  );

  function field(fieldData, index) {
    return (
      <div
        key={fieldData.id}
        className={`${
          index === tableData.fields.length - 1
            ? ""
            : "border-b border-gray-400"
        } group h-[36px] px-2 py-1 flex justify-between items-center gap-1 w-full overflow-hidden`}
        onPointerEnter={(e) => {
          if (!e.isPrimary) return;

          setHoveredField(index);
          setHoveredTable({
            tableId: tableData.id,
            fieldId: fieldData.id,
          });
        }}
        onPointerLeave={(e) => {
          if (!e.isPrimary) return;

          setHoveredField(null);
          setHoveredTable({
            tableId: null,
            fieldId: null,
          });
        }}
        onPointerDown={(e) => {
          // Required for onPointerLeave to trigger when a touch pointer leaves
          // https://stackoverflow.com/a/70976017/1137077
          e.target.releasePointerCapture(e.pointerId);
        }}
      >
        <div
          className={`${
            hoveredField === index ? "text-zinc-400" : ""
          } flex items-center gap-2 overflow-hidden`}
        >
          <button
            className={`shrink-0 w-[16px] h-[16px] rounded-full border-2 transition-colors duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center ${
              hoveredField === index 
                ? "bg-blue-500 border-blue-600" 
                : "bg-blue-400 border-blue-500 hover:bg-blue-500 hover:border-blue-600"
            }`}
            title="拖拽连接到其他表的字段"
            onPointerDown={(e) => {
              if (!e.isPrimary) return;

              handleGripField();
              setLinkingLine((prev) => ({
                ...prev,
                startFieldId: fieldData.id,
                startTableId: tableData.id,
                startX: tableData.x + 15,
                startY:
                  tableData.y +
                  index * tableFieldHeight +
                  tableHeaderHeight +
                  tableColorStripHeight +
                  12,
                endX: tableData.x + 15,
                endY:
                  tableData.y +
                  index * tableFieldHeight +
                  tableHeaderHeight +
                  tableColorStripHeight +
                  12,
              }));
            }}
          >
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 10 10" 
              fill="none" 
              className="text-white"
            >
              <path 
                d="M5 1.5V8.5M1.5 5H8.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="flex flex-row items-center gap-2 overflow-hidden">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {fieldData.name}
            </span>
            {settings.showComments && fieldData.comment && fieldData.comment.trim() !== "" && (
              <span className="text-xs text-gray-500 italic overflow-hidden text-ellipsis whitespace-nowrap">
                ({fieldData.comment})
              </span>
            )}
          </div>
        </div>
        <div className="text-zinc-400">
          {hoveredField === index ? (
            <Button
              theme="solid"
              size="small"
              style={{
                backgroundColor: "#d42020b3",
              }}
              icon={<IconMinus />}
              onClick={() => deleteField(fieldData, tableData.id)}
            />
          ) : settings.showDataTypes ? (
            <div className="flex gap-1 items-center">
              {fieldData.primary && <IconKeyStroked />}
              {!fieldData.notNull && <span className="font-mono">?</span>}
              <span
                className={
                  "font-mono " + dbToTypes[database][fieldData.type].color
                }
              >
                {fieldData.type +
                  ((dbToTypes[database][fieldData.type].isSized ||
                    dbToTypes[database][fieldData.type].hasPrecision) &&
                  fieldData.size &&
                  fieldData.size !== ""
                    ? `(${fieldData.size})`
                    : "")}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
