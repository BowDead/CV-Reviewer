import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import styles from "./CvCreator.module.scss";

function EntryField({ field, value, disabled, onChange }) {
  const { t } = useTranslation();
  const className = field.wide
    ? `${styles.field} ${styles.wide}`
    : styles.field;

  return (
    <label className={className}>
      {field.label}
      {field.type === "textarea" && (
        <textarea
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.type === "select" && (
        <select
          className={styles.input}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{t("cvCreator.chooseLevel")}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      {!field.type && (
        <input
          className={styles.input}
          value={value}
          maxLength={field.maxLength}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function CreatorEntries({
  title,
  addLabel,
  items,
  fields,
  max,
  disabled,
  createItem,
  onChange,
}) {
  const { t } = useTranslation();

  function change(key, name, value) {
    onChange(
      items.map((item) =>
        item.key === key ? { ...item, [name]: value } : item,
      ),
    );
  }

  function moveUp(index) {
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function remove(key) {
    onChange(items.filter((item) => item.key !== key));
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.label}>{title}</h2>
      {items.map((item, index) => (
        <div key={item.key} className={styles.entry}>
          <div className={styles.grid}>
            {fields.map((field) => (
              <EntryField
                key={field.name}
                field={field}
                value={item[field.name]}
                disabled={disabled}
                onChange={(value) => change(item.key, field.name, value)}
              />
            ))}
          </div>
          <div className={styles.entryActions}>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled || index === 0}
              onClick={() => moveUp(index)}
            >
              {t("cvCreator.moveUp")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => remove(item.key)}
            >
              {t("cvCreator.remove")}
            </Button>
          </div>
        </div>
      ))}
      <div>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || items.length >= max}
          onClick={() => onChange([...items, createItem()])}
        >
          {addLabel}
        </Button>
      </div>
    </section>
  );
}
