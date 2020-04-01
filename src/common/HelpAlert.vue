<template>
  <div class="common-help-alert">
    <el-popover
      :trigger="trigger"
      :width="popoverWidth"
      placement="bottom-end"
      popper-class="common-help-alert--popover"
      ref="helpPopover"
      v-if="showHelp&&!!dataSource"
      v-once
    >
      <div class="common-help-alert--head">
        <slot :data="dataSource" name="collapseHead">
          <h3 v-if="dataSource.title">{{dataSource.title}}</h3>
          <p v-if="dataSource.desc">{{dataSource.desc}}</p>
        </slot>
      </div>
      <el-collapse :accordion="accordion" v-model="activeNames">
        <el-collapse-item
          :key="index"
          :name="index"
          :title="desc.title"
          class="common-help-alert--txt"
          v-for="(desc,index) in dataSource.items"
        >
          <slot :data="desc" name="collapseBody">
            {{desc.content}}
            <template v-if="desc.frags&&desc.frags.length">
              <div class="common-help-alert--foot mt10">
                <p :key="item" class="desc" v-for="item of desc.frags">{{item}}</p>
              </div>
            </template>
          </slot>
        </el-collapse-item>
      </el-collapse>
      <div class="common-help-alert--foot mt10" v-if="hasFootSlot">
        <slot :data="dataSource" name="collapseFoot"></slot>
      </div>
    </el-popover>
    <el-alert :closable="closable" :show-icon="showIcon" :type="type" title>
      <div class="el-alert__title is-bold" v-if="title||hasAlertTitle">
        <slot name="title">{{title}}</slot>
      </div>
      <div class="el-alert__description" v-if="content||hasAlertContent">
        <slot name="content">{{content}}</slot>
      </div>
      <el-tooltip class="item" effect="dark" placement="top">
        <div slot="content">
          <slot name="tipContent">
            <span v-if="helpTip">{{helpTip}}</span>
          </slot>
        </div>
        <template v-if="showHelp&&!!dataSource">
          <div class="help" v-popover:helpPopover>
            <slot name="helpContent">
              <i class="rjucd-help fs32"></i>
            </slot>
          </div>
        </template>
      </el-tooltip>
    </el-alert>
  </div>
</template>
<script>
const types = ['info', 'error', 'success', 'warning']
const triggers = ['click', 'focus', 'hover', 'manual']
import dateJson from '@/tips'
import { Alert, Collapse, CollapseItem } from 'element-ui'
export default {
  name: 'help-alert',
  props: {
    title: {
      type: String,
      default: I18N.t('phrase.explain')
    },
    closable: {
      type: Boolean,
      default: false
    },
    type: {
      validator(v) {
        return types.indexOf(v) > -1
      },
      default: 'info'
    },
    trigger: {
      validator(v) {
        return triggers.indexOf(v) > -1
      },
      default: 'click'
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    showHelp: {
      type: Boolean,
      default: true
    },
    helpTip: {
      default: I18N.t('phrase.help')
    },
    popoverWidth: {
      type: Number,
      default: 400
    },
    accordion: {
      type: Boolean,
      default: true
    },
    content: String,
    jsonKey: {
      type: String
    }
  },
  data() {
    return {
      activeNames: -1
    }
  },
  components: {
    [Alert.name]: Alert,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem
  },
  computed: {
    dataSource() {
      return Object.freeze(dateJson[this.jsonKey])
    },
    hasFootSlot() {
      return !!this.$slots.collapseFoot
    },
    hasAlertTitle() {
      return !!this.$slots.title
    },
    hasAlertContent() {
      return !!this.$slots.content
    }
  }
}
</script>
<style lang="scss">
@import '../style/utils/_variable.scss';
div.common-help-alert {
  margin-bottom: 15px;
  .el-alert--info {
    background-color: $box-bgc;
    .el-alert__description {
      color: $--color-text-regular;
    }
  }
  .el-alert__description {
    margin-top: 0;
    font-size: 13px !important;
  }
  .el-alert__title {
    font-size: 14px !important;
    & ~ .el-alert__description {
      margin: 3px 0;
    }
  }
  .el-alert__icon {
    display: inline-block;
    vertical-align: middle;
    &.el-icon-info {
      color: $theme;
    }
  }
  .el-alert__content {
    display: inline-block;
    vertical-align: middle;
    padding-right: 24px;
    .help {
      position: absolute;
      top: 50%;
      right: 0;
      color: $--color-text-regular;
      cursor: pointer;
      transform: translateY(-50%);
      &:hover {
        color: $theme;
      }
      .fs32 {
        margin-right: 16px;
        font-size: 32px;
      }
    }
  }
  &--txt {
    white-space: normal;
    word-wrap: break-word;
  }
  &--head,
  &--foot {
    margin-bottom: 10px;
    width: 93%;
    h3,
    .tit {
      font-size: 16px;
      color: $--color-text-regular;
      margin-bottom: 15px;
    }
    p,
    .desc {
      color: $--color-text-secondary;
      font-size: 80%;
      line-height: 1.5;
      position: relative;
      margin-bottom: 5px;
    }
  }
  &--foot {
    p,
    .desc {
      position: relative;
      padding-left: 8px;
      &:before {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        display: block;
        background: currentColor;
        left: 0;
        margin-top: 7px;
      }
    }
  }
  &--popover {
    max-height: 400px;
    overflow: hidden;
    overflow-y: auto;
    .el-collapse-item__content {
      color: $--color-text-secondary;
      width: 93%;
    }
    .el-collapse-item__header {
      color: $theme;
      &:hover {
        color: darken($theme, 8%);
      }
    }
  }
}
</style>
