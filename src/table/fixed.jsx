import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { dom } from '../util';
import HeaderComponent from './fixed/header';
import BodyComponent from './fixed/body';
import WrapperComponent from './fixed/wrapper';
import { statics } from './util';

export default function fixed(BaseComponent) {
    /** Table */
    class FixedTable extends React.Component {
        static FixedHeader = HeaderComponent;
        static FixedBody = BodyComponent;
        static FixedWrapper = WrapperComponent;
        static propTypes = {
            /**
             * 是否具有表头
             */
            hasHeader: PropTypes.bool,
            /**
             * 表头是否固定，该属性配合maxBodyHeight使用，当内容区域的高度超过maxBodyHeight的时候，在内容区域会出现滚动条
             */
            fixedHeader: PropTypes.bool,
            /**
             * 最大内容区域的高度,在`fixedHeader`为`true`的时候,超过这个高度会出现滚动条
             */
            maxBodyHeight: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string,
            ]),
            ...BaseComponent.propTypes,
        };

        static defaultProps = {
            ...BaseComponent.defaultProps,
            hasHeader: true,
            fixedHeader: false,
            maxBodyHeight: 200,
            components: {},
            refs: {},
            prefix: 'next-',
        };

        static childContextTypes = {
            fixedHeader: PropTypes.bool,
            getNode: PropTypes.func,
            onScroll: PropTypes.func,
            maxBodyHeight: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string,
            ]),
        };

        getChildContext() {
            return {
                fixedHeader: this.props.fixedHeader,
                maxBodyHeight: this.props.maxBodyHeight,
                onScroll: this.onScroll,
                getNode: this.getNode,
            };
        }

        componentDidMount() {
            this.adjustFixedHeaderSize();
        }

        componentDidUpdate() {
            this.adjustFixedHeaderSize();
        }

        getNode = (type, node, lockType) => {
            lockType = lockType
                ? lockType.charAt(0).toUpperCase() + lockType.substr(1)
                : '';
            this[`${type}${lockType}Node`] = node;
        };

        onScroll = (current = {}) => {
            const { onScroll, lockType } = this.props;
            onScroll && onScroll(current);

            if (lockType || !current.target) {
                return;
            }

            const { scrollLeft, scrollTop } = current.target;
            if (current.target === this.bodyNode) {
                if (this.bodyNode && scrollTop !== this.bodyNode.scrollTop) {
                    this.bodyNode.scrollTop = scrollTop;
                }
                if (
                    this.headerNode &&
                    scrollLeft !== this.headerNode.scrollLeft
                ) {
                    this.headerNode.scrollLeft = scrollLeft;
                }
            } else if (current.target === this.headerNode) {
                if (this.bodyNode && scrollLeft !== this.bodyNode.scrollLeft) {
                    this.bodyNode.scrollLeft = scrollLeft;
                }
            }
        };

        adjustFixedHeaderSize() {
            const { hasHeader, rtl } = this.props;
            const paddingName = rtl ? 'paddingLeft' : 'paddingRight';
            const marginName = rtl ? 'marginLeft' : 'marginRight';
            const body = this.bodyNode;

            if (hasHeader && !this.props.lockType && body) {
                const scrollBarSize = dom.scrollbar().width;
                const hasVerScroll = body.scrollHeight > body.clientHeight,
                    hasHozScroll = body.scrollWidth > body.clientWidth;
                const style = {
                    [paddingName]: scrollBarSize,
                    [marginName]: scrollBarSize,
                };

                if (!hasVerScroll || !+scrollBarSize) {
                    style[paddingName] = 0;
                    style[marginName] = 0;
                }

                if (+scrollBarSize) {
                    style.marginBottom = -scrollBarSize;
                    if (hasHozScroll) {
                        style.paddingBottom = scrollBarSize;
                    } else {
                        style.paddingBottom = scrollBarSize;
                        style[marginName] = 0;
                    }
                }

                dom.setStyle(this.headerNode, style);
            }
        }

        render() {
            /* eslint-disable no-unused-vars, prefer-const */
            let {
                components,
                className,
                prefix,
                fixedHeader,
                lockType,
                dataSource,
                maxBodyHeight,
                ...others
            } = this.props;
            if (fixedHeader) {
                components = { ...components };
                if (!components.Header) {
                    components.Header = HeaderComponent;
                }
                if (!components.Body) {
                    components.Body = BodyComponent;
                }
                if (!components.Wrapper) {
                    components.Wrapper = WrapperComponent;
                }
                className = classnames({
                    [`${prefix}table-fixed`]: true,
                    [`${prefix}table-wrap-empty`]: !dataSource.length,
                    [className]: className,
                });
            }
            const event = lockType
                ? {}
                : {
                      onScroll: this.onScroll,
                  };

            return (
                <BaseComponent
                    {...others}
                    {...event}
                    dataSource={dataSource}
                    lockType={lockType}
                    components={components}
                    className={className}
                    prefix={prefix}
                />
            );
        }
    }
    statics(FixedTable, BaseComponent);
    return FixedTable;
}
