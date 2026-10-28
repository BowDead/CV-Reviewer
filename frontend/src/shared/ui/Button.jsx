import styles from "./Button.module.scss";

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  type = "button",
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    size === "sm" && styles.small,
    block && styles.block,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
